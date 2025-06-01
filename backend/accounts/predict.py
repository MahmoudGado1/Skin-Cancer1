import numpy as np
import torch
from torchvision import models, transforms
from PIL import Image

class_names = ['akiec', 'bcc', 'bkl', 'df', 'nv', 'vasc', 'mel']
disease_info = {
    'akiec': "Actinic Keratoses and Intraepithelial Carcinoma (pre-cancerous lesion)",
    'bcc': "Basal Cell Carcinoma (a common type of skin cancer)",
    'bkl': "Benign Keratosis (non-cancerous lesion)",
    'df': "Dermatofibroma (benign skin lesion)",
    'nv': "Melanocytic Nevus (a common mole)",
    'vasc': "Vascular Lesions (benign lesion of blood vessels)",
    'mel': "Melanoma (most dangerous type of skin cancer)"
}

model_path = 'F:/Front End/React/PROJECT/SkinCancer/Skin-Cancer/backend/model_exp11.pth'
model = models.resnet50(pretrained=False)
num_ftrs = model.fc.in_features 
model.fc = torch.nn.Linear(num_ftrs, 7)
model.load_state_dict(torch.load(model_path, map_location=torch.device("cpu")))
model.eval()

def predict_image(image):
    try:
        if image is None or image.size == 0:
            return {
                "diagnosis_result": None,
                "description": "Invalid image input.",
                "probability": 0.0,
                "top_predictions": []
            }

        pil_image = Image.fromarray(np.uint8(image))
        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        img_tensor = transform(pil_image).unsqueeze(0)

        with torch.no_grad():
            output = model(img_tensor)
            probabilities = torch.softmax(output, dim=1)
            predicted_class_idx = torch.argmax(probabilities, dim=1).item()
            probability = probabilities[0][predicted_class_idx].item()
            values, indices = torch.topk(probabilities[0], 3)
            top_predictions = [{"label": class_names[idx.item()], "probability": val.item()} for val, idx in zip(values, indices)]

        return {
            "diagnosis_result": class_names[predicted_class_idx],
            "description": disease_info[class_names[predicted_class_idx]],
            "probability": probability,
            "top_predictions": top_predictions
        }

    except Exception as e:
        print(f"Prediction Error: {e}")
        return {
            "diagnosis_result": None,
            "description": f"An error occurred during prediction: {str(e)}",
            "probability": 0.0,
            "top_predictions": []
        }