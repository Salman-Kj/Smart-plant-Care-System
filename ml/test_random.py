import argparse
import json
import os
import random

import tensorflow as tf

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG"}


def list_images(dataset_dir: str, class_name: str):
    class_dir = os.path.join(dataset_dir, class_name)
    files = []
    for name in os.listdir(class_dir):
        path = os.path.join(class_dir, name)
        if os.path.isfile(path) and os.path.splitext(name)[1] in ALLOWED_EXTENSIONS:
            files.append(path)
    return files


def load_image(image_path: str, image_size: int):
    raw = tf.io.read_file(image_path)
    img = tf.image.decode_image(raw, channels=3, expand_animations=False)
    img = tf.image.resize(img, (image_size, image_size))
    img = tf.cast(img, tf.float32)
    img = tf.keras.applications.mobilenet_v2.preprocess_input(img)
    return tf.expand_dims(img, axis=0)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data_dir", default="PlantVillage")
    parser.add_argument(
        "--model",
        default=os.path.join("ml", "plant_disease_model.keras"),
    )
    parser.add_argument(
        "--classes",
        default=os.path.join("ml", "model", "class_names.json"),
    )
    parser.add_argument("--image_size", type=int, default=224)
    parser.add_argument("--samples", type=int, default=8)
    args = parser.parse_args()

    with open(args.classes, "r", encoding="utf-8") as f:
        class_names = json.load(f)

    dataset_dir = os.path.abspath(args.data_dir)
    model = tf.keras.models.load_model(args.model)

    random.seed(123)
    picks = []
    for class_name in class_names:
        images = list_images(dataset_dir, class_name)
        if images:
            picks.append((random.choice(images), class_name))

    if len(picks) < args.samples:
        all_images = []
        for class_name in class_names:
            for path in list_images(dataset_dir, class_name):
                all_images.append((path, class_name))
        random.shuffle(all_images)
        picks = all_images[: args.samples]
    else:
        random.shuffle(picks)
        picks = picks[: args.samples]

    for path, actual in picks:
        img = load_image(path, args.image_size)
        preds = model.predict(img, verbose=0)[0]
        pred_index = int(tf.argmax(preds).numpy())
        pred_class = class_names[pred_index]
        confidence = float(preds[pred_index]) * 100.0
        print(
            f"Predicted: {pred_class} ({confidence:.2f}%) | "
            f"Actual: {actual} | File: {os.path.basename(path)}"
        )


if __name__ == "__main__":
    main()
