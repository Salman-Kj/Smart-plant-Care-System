import argparse
import os
import random
import shutil

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG"}

PLANTDOC_MAP = {
    "Bell_pepper leaf": "Pepper__bell___healthy",
    "Bell_pepper leaf spot": "Pepper__bell___Bacterial_spot",
    "Potato leaf early blight": "Potato___Early_blight",
    "Potato leaf late blight": "Potato___Late_blight",
    "Tomato Early blight leaf": "Tomato_Early_blight",
    "Tomato leaf bacterial spot": "Tomato_Bacterial_spot",
    "Tomato leaf late blight": "Tomato_Late_blight",
    "Tomato mold leaf": "Tomato_Leaf_Mold",
    "Tomato Septoria leaf spot": "Tomato_Septoria_leaf_spot",
}


def list_images(folder: str):
    files = []
    for name in os.listdir(folder):
        path = os.path.join(folder, name)
        if os.path.isfile(path) and os.path.splitext(name)[1] in ALLOWED_EXTENSIONS:
            files.append(path)
    return files


def ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)


def copy_images(images, target_dir, prefix):
    ensure_dir(target_dir)
    for index, path in enumerate(images, start=1):
        ext = os.path.splitext(path)[1].lower()
        name = f"{prefix}_{index:05d}{ext}"
        shutil.copy2(path, os.path.join(target_dir, name))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--plantvillage", default="PlantVillage")
    parser.add_argument("--plantdoc-train", default="PlantDoc train")
    parser.add_argument("--plantdoc-test", default="PlantDoc test")
    parser.add_argument("--out-dir", default="PlantCombined")
    parser.add_argument("--test-ratio", type=float, default=0.1)
    args = parser.parse_args()

    random.seed(123)

    plantvillage_dir = os.path.abspath(args.plantvillage)
    plantdoc_train = os.path.abspath(args.plantdoc_train)
    plantdoc_test = os.path.abspath(args.plantdoc_test)
    out_dir = os.path.abspath(args.out_dir)

    train_out = os.path.join(out_dir, "train")
    test_out = os.path.join(out_dir, "test")
    ensure_dir(train_out)
    ensure_dir(test_out)

    classes = sorted(
        [
            name
            for name in os.listdir(plantvillage_dir)
            if os.path.isdir(os.path.join(plantvillage_dir, name))
        ]
    )

    print(f"PlantVillage classes: {classes}")

    for class_name in classes:
        class_dir = os.path.join(plantvillage_dir, class_name)
        images = list_images(class_dir)
        random.shuffle(images)
        split_idx = max(1, int(len(images) * (1 - args.test_ratio)))
        train_images = images[:split_idx]
        test_images = images[split_idx:]
        copy_images(train_images, os.path.join(train_out, class_name), "pv")
        copy_images(test_images, os.path.join(test_out, class_name), "pv")

    for source_root, target_root, prefix in [
        (plantdoc_train, train_out, "pdtr"),
        (plantdoc_test, test_out, "pdte"),
    ]:
        for folder in os.listdir(source_root):
            source_folder = os.path.join(source_root, folder)
            if not os.path.isdir(source_folder):
                continue
            target_class = PLANTDOC_MAP.get(folder)
            if not target_class:
                print(f"Skipping PlantDoc class: {folder}")
                continue
            images = list_images(source_folder)
            copy_images(images, os.path.join(target_root, target_class), prefix)

    print(f"Combined dataset ready at: {out_dir}")


if __name__ == "__main__":
    main()
