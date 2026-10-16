import argparse
import json
import os
import random

import tensorflow as tf

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG"}


def list_classes(dataset_dir: str):
    classes = sorted(
        [
            name
            for name in os.listdir(dataset_dir)
            if os.path.isdir(os.path.join(dataset_dir, name))
        ]
    )
    if not classes:
        raise ValueError(f"No class folders found in {dataset_dir}")
    return classes


def list_images(dataset_dir: str, class_name: str):
    class_dir = os.path.join(dataset_dir, class_name)
    files = []
    for name in os.listdir(class_dir):
        path = os.path.join(class_dir, name)
        if os.path.isfile(path) and os.path.splitext(name)[1] in ALLOWED_EXTENSIONS:
            files.append(path)
    return files


def sample_balanced_images(dataset_dir: str, class_names: list[str], max_total: int):
    random.seed(123)
    class_files = {name: list_images(dataset_dir, name) for name in class_names}
    min_count = min(len(files) for files in class_files.values())
    per_class = min(min_count, max_total // len(class_names))

    if per_class <= 0:
        raise ValueError("Not enough images to sample a balanced dataset.")

    samples = []
    for class_index, class_name in enumerate(class_names):
        files = class_files[class_name]
        random.shuffle(files)
        selected = files[:per_class]
        samples.extend((path, class_index) for path in selected)

    random.shuffle(samples)
    return samples


def list_all_images(dataset_dir: str, class_names: list[str]):
    samples = []
    for class_index, class_name in enumerate(class_names):
        files = list_images(dataset_dir, class_name)
        samples.extend((path, class_index) for path in files)
    random.shuffle(samples)
    return samples


def compute_class_weights(labels: list[int], num_classes: int):
    counts = [0] * num_classes
    for label in labels:
        counts[label] += 1
    total = sum(counts)
    weights = {}
    for idx, count in enumerate(counts):
        if count > 0:
            weights[idx] = total / (num_classes * count)
    return weights


def build_model(num_classes: int, image_size: int):
    data_augmentation = tf.keras.Sequential(
        [
            tf.keras.layers.RandomFlip("horizontal"),
            tf.keras.layers.RandomRotation(0.1),
            tf.keras.layers.RandomZoom(0.1),
            tf.keras.layers.RandomContrast(0.1),
            tf.keras.layers.RandomBrightness(0.1),
            tf.keras.layers.RandomTranslation(0.05, 0.05),
        ],
        name="data_augmentation",
    )

    base_model = tf.keras.applications.MobileNetV2(
        input_shape=(image_size, image_size, 3),
        include_top=False,
        weights="imagenet",
    )
    base_model.trainable = False

    inputs = tf.keras.layers.Input(shape=(image_size, image_size, 3))
    x = data_augmentation(inputs)
    x = base_model(x, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dropout(0.2)(x)
    outputs = tf.keras.layers.Dense(num_classes, activation="softmax")(x)
    model = tf.keras.Model(inputs, outputs)

    return model, base_model


def make_dataset(
    filepaths: list[str],
    labels: list[int],
    image_size: int,
    batch_size: int,
    num_classes: int,
    shuffle: bool,
):
    ds = tf.data.Dataset.from_tensor_slices((filepaths, labels))
    if shuffle:
        ds = ds.shuffle(buffer_size=len(filepaths), seed=123, reshuffle_each_iteration=True)

    def load_image(path, label):
        raw = tf.io.read_file(path)
        img = tf.image.decode_image(raw, channels=3, expand_animations=False)
        img = tf.image.resize(img, (image_size, image_size))
        img = tf.cast(img, tf.float32)
        img = tf.keras.applications.mobilenet_v2.preprocess_input(img)
        label = tf.cast(label, tf.int32)
        return img, label

    ds = ds.map(load_image, num_parallel_calls=tf.data.AUTOTUNE)
    ds = ds.batch(batch_size).prefetch(tf.data.AUTOTUNE)
    return ds


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--data_dir",
        default="PlantVillage",
        help="Path to PlantVillage dataset directory",
    )
    parser.add_argument("--image_size", type=int, default=224)
    parser.add_argument("--batch_size", type=int, default=32)
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--fine_tune_epochs", type=int, default=5)
    parser.add_argument("--fine_tune_layers", type=int, default=20)
    parser.add_argument("--max_images", type=int, default=10000)
    parser.add_argument("--balanced", action="store_true")
    parser.add_argument("--use_class_weights", action="store_true")
    parser.add_argument(
        "--model_out",
        default=os.path.join("ml", "plant_disease_model.keras"),
    )
    parser.add_argument(
        "--class_map_out",
        default=os.path.join("ml", "model", "class_names.json"),
    )
    args = parser.parse_args()

    dataset_dir = os.path.abspath(args.data_dir)
    if not os.path.isdir(dataset_dir):
        raise FileNotFoundError(f"Dataset path not found: {dataset_dir}")

    class_names = list_classes(dataset_dir)
    print(f"Detected classes ({len(class_names)}): {class_names}")

    if args.balanced:
        samples = sample_balanced_images(dataset_dir, class_names, args.max_images)
    else:
        samples = list_all_images(dataset_dir, class_names)
        if args.max_images > 0 and len(samples) > args.max_images:
            random.shuffle(samples)
            samples = samples[: args.max_images]
    total_count = len(samples)
    print(f"Using {total_count} images (balanced, max {args.max_images}).")

    train_count = int(total_count * 0.8)
    val_count = int(total_count * 0.1)
    test_count = total_count - train_count - val_count

    train_samples = samples[:train_count]
    val_samples = samples[train_count : train_count + val_count]
    test_samples = samples[train_count + val_count :]

    train_paths, train_labels = zip(*train_samples)
    val_paths, val_labels = zip(*val_samples)
    test_paths, test_labels = zip(*test_samples)

    train_ds = make_dataset(
        list(train_paths),
        list(train_labels),
        args.image_size,
        args.batch_size,
        len(class_names),
        shuffle=True,
    )
    val_ds = make_dataset(
        list(val_paths),
        list(val_labels),
        args.image_size,
        args.batch_size,
        len(class_names),
        shuffle=False,
    )
    test_ds = make_dataset(
        list(test_paths),
        list(test_labels),
        args.image_size,
        args.batch_size,
        len(class_names),
        shuffle=False,
    )

    model, base_model = build_model(len(class_names), args.image_size)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )

    os.makedirs(os.path.dirname(args.model_out), exist_ok=True)

    callbacks = [
        tf.keras.callbacks.EarlyStopping(
            monitor="val_accuracy", patience=5, restore_best_weights=True
        ),
        tf.keras.callbacks.ModelCheckpoint(
            args.model_out, monitor="val_accuracy", save_best_only=True
        ),
    ]

    class_weights = None
    if args.use_class_weights:
        class_weights = compute_class_weights(list(train_labels), len(class_names))

    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=args.epochs,
        callbacks=callbacks,
        class_weight=class_weights,
    )

    base_model.trainable = True
    if args.fine_tune_layers > 0:
        for layer in base_model.layers[:-args.fine_tune_layers]:
            layer.trainable = False

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )

    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=args.fine_tune_epochs,
        callbacks=callbacks,
        class_weight=class_weights,
    )

    model.save(args.model_out)
    with open(args.class_map_out, "w", encoding="utf-8") as f:
        json.dump(class_names, f, ensure_ascii=True, indent=2)

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

    print("Training complete.")


if __name__ == "__main__":
    main()
