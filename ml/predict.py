import argparse
import json
import sys

import tensorflow as tf


def load_json(path: str, default):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default


def load_image(image_path: str, image_size: int):
    raw = tf.io.read_file(image_path)
    img = tf.image.decode_image(raw, channels=3, expand_animations=False)
    img = tf.image.resize(img, (image_size, image_size))
    img = tf.cast(img, tf.float32)
    img = tf.keras.applications.mobilenet_v2.preprocess_input(img)
    return tf.expand_dims(img, axis=0)


def normalize_label(label: str):
    return label.replace("__", "_").replace("_", " ").strip()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", required=True)
    parser.add_argument("--model", required=True)
    parser.add_argument("--classes", required=True)
    parser.add_argument("--image_size", type=int, default=224)
    args = parser.parse_args()

    class_names = load_json(args.classes, [])
    if not class_names:
        raise ValueError("Class names not found. Train the model first.")

    model = tf.keras.models.load_model(args.model)
    image_tensor = load_image(args.image, args.image_size)
    preds = model.predict(image_tensor, verbose=0)[0]

    best_index = int(tf.argmax(preds).numpy())
    confidence = float(preds[best_index]) * 100.0
    class_name = class_names[best_index]

    response = {
        "disease_name": class_name,
        "confidence_percentage": round(confidence, 2),
    }

    print(json.dumps(response))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        sys.exit(1)
