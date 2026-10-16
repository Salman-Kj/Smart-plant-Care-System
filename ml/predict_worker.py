import argparse
import base64
import io
import json
import os
import sys

import numpy as np
import tensorflow as tf
from PIL import Image


def load_json(path: str, default):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default


def preprocess_image(image_bytes: bytes, image_size: int):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize((image_size, image_size))
    img = np.array(image).astype("float32") / 255.0
    # Keep compatibility with MobileNetV2 preprocess_input (range [-1, 1]).
    img = (img * 2.0) - 1.0
    return tf.expand_dims(img, axis=0)


def build_response(class_name: str, confidence: float, info: dict, fallback: dict):
    return {
        "disease_name": class_name,
        "confidence_percentage": round(confidence, 2),
        "cause": info.get("cause", fallback["cause"]),
        "solution": info.get("solution", fallback["solution"]),
        "medicine": info.get("recommended_medicine", fallback["recommended_medicine"]),
    }


def main():
    os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")
    os.environ.setdefault("TF_DETERMINISTIC_OPS", "1")
    tf.random.set_seed(42)

    parser = argparse.ArgumentParser()
    parser.add_argument("--model", required=True)
    parser.add_argument("--classes", required=True)
    parser.add_argument("--info", required=True)
    parser.add_argument("--image_size", type=int, default=224)
    args = parser.parse_args()

    class_names = load_json(args.classes, [])
    if not class_names:
        raise ValueError("Class names not found. Train the model first.")

    disease_info = load_json(args.info, {})
    fallback_info = disease_info.get(
        "default",
        {
            "cause": "Unknown disease cause. Please consult a plant expert.",
            "solution": "Monitor the plant and improve care conditions.",
            "recommended_medicine": "No specific medicine available.",
        },
    )

    try:
        tf.config.experimental.enable_op_determinism()
    except Exception:
        pass

    model = tf.keras.models.load_model(args.model, compile=False)
    sys.stdout.write(json.dumps({"type": "ready"}) + "\n")
    sys.stdout.flush()

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            payload = json.loads(line)
            request_id = payload.get("id")
            image_b64 = payload.get("image_base64", "")
            image_bytes = base64.b64decode(image_b64)

            image_tensor = preprocess_image(image_bytes, args.image_size)
            preds = model(image_tensor, training=False).numpy()[0]
            best_index = int(tf.argmax(preds).numpy())
            confidence = float(preds[best_index]) * 100.0
            class_name = class_names[best_index]

            info = disease_info.get(class_name, fallback_info)
            response = build_response(class_name, confidence, info, fallback_info)
            response["id"] = request_id
        except Exception as exc:
            response = {"id": payload.get("id") if "payload" in locals() else None, "error": str(exc)}

        sys.stdout.write(json.dumps(response) + "\n")
        sys.stdout.flush()


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        sys.exit(1)
