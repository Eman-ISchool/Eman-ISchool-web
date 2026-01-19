import sys
from PIL import Image, ImageEnhance, ImageOps

def reveal_hidden_text(image_path, output_path):
    try:
        img = Image.open(image_path).convert("RGBA")
        
        # Split into bands
        r, g, b, a = img.split()
        
        # Create a mask for very light pixels (near white)
        # We want to darken 'white' text on 'white' background if there's a slight difference
        # Or if text is white and background is transparent/white.
        
        # Approach 1: High contrast on luminance
        gray = img.convert("L")
        # Increase contrast significantly
        enhancer = ImageEnhance.Contrast(gray)
        high_contrast = enhancer.enhance(5.0) # Boost contrast
        
        # Approach 2: If text is white (255,255,255) and bg is slightly off-white (e.g. 250,250,250)
        # We can map ranges.
        
        # Let's simple try to extract edges or boost contrast of the grayscale
        high_contrast.save(output_path)
        print(f"Processed image saved to {output_path}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python reveal_text.py <input_path> <output_path>")
    else:
        reveal_hidden_text(sys.argv[1], sys.argv[2])
