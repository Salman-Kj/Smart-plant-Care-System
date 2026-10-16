import argparse
import json
import os

import tensorflow as tf

from train import list_classes, make_dataset, sample_balanced_images


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data_dir", default="PlantVillage")
    parser.add_argument(
        "--model",
        default=os.path.join("ml", "plant_disease_model.keras"),
    )
    parser.add_argument(
        "--class_map_out",
        default=os.path.join("ml", "model", "class_names.json"),
    )
    parser.add_argument("--image_size", type=int, default=224)
    parser.add_argument("--batch_size", type=int, default=32)
    parser.add_argument("--max_images", type=int, default=10000)
    parser.add_argument(
        "--use_full_dir",
        action="store_true",
        help="Evaluate on the full directory without train/val/test splitting.",
    )
    args = parser.parse_args()

    dataset_dir = os.path.abspath(args.data_dir)
    class_names = list_classes(dataset_dir)

    if args.use_full_dir:
        from train import list_all_images

        samples = list_all_images(dataset_dir, class_names)
        if args.max_images > 0 and len(samples) > args.max_images:
            samples = samples[: args.max_images]
        test_samples = samples
    else:
        samples = sample_balanced_images(dataset_dir, class_names, args.max_images)
        total_count = len(samples)
        train_count = int(total_count * 0.8)
        val_count = int(total_count * 0.1)

        test_samples = samples[train_count + val_count :]
    test_paths, test_labels = zip(*test_samples)

    test_ds = make_dataset(
        list(test_paths),
        list(test_labels),
        args.image_size,
        args.batch_size,
        len(class_names),
        shuffle=False,
    )

    model = tf.keras.models.load_model(args.model)
    test_loss, test_acc = model.evaluate(test_ds, verbose=0)
    print(f"Test accuracy: {test_acc:.4f}")

    y_true = []
    y_pred = []
    for batch_images, batch_labels in test_ds:
        preds = model.predict(batch_images, verbose=0)
        y_true.extend(batch_labels.numpy().tolist())
        y_pred.extend(tf.argmax(preds, axis=1).numpy().tolist())

    confusion = tf.math.confusion_matrix(y_true, y_pred, num_classes=len(class_names))
    print("Confusion matrix:")
    print(confusion.numpy())

    with open(args.class_map_out, "w", encoding="utf-8") as f:
        json.dump(class_names, f, ensure_ascii=True, indent=2)


if __name__ == "__main__":
    main()
