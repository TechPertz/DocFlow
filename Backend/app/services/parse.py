#!/usr/bin/env python3
import sys
import fitz  # PyMuPDF

def extract_text_from_page(page, zone_threshold=15, horizontal_threshold_ratio=0.2):
    """
    Extract text from a page by:
    1. Grouping text blocks into vertical zones (blocks whose top y values are close).
    2. Merging adjacent zones that overlap vertically (i.e. are on the same horizontal line).
    3. For each merged group, if the horizontal spread is significant, partition blocks
       into left and right columns (left-first); otherwise, treat as a single column.
    4. Concatenate text from each group in order.
    """
    blocks = page.get_text("dict")["blocks"]
    text_blocks = [b for b in blocks if b.get("lines")]
    if not text_blocks:
        return ""
    
    text_blocks = sorted(text_blocks, key=lambda b: b["bbox"][1])
    
    zones = []
    current_zone = [text_blocks[0]]
    current_zone_top = text_blocks[0]["bbox"][1]
    for block in text_blocks[1:]:
        block_top = block["bbox"][1]
        if block_top - current_zone_top < zone_threshold:
            current_zone.append(block)
        else:
            zones.append(current_zone)
            current_zone = [block]
            current_zone_top = block_top
    if current_zone:
        zones.append(current_zone)
    
    merged_groups = []
    current_group = zones[0]
    group_y_min = min(b["bbox"][1] for b in current_group)
    group_y_max = max(b["bbox"][3] for b in current_group)
    
    for zone in zones[1:]:
        zone_y_min = min(b["bbox"][1] for b in zone)
        zone_y_max = max(b["bbox"][3] for b in zone)
        if zone_y_min <= group_y_max:
            current_group.extend(zone)
            group_y_max = max(group_y_max, zone_y_max)
        else:
            merged_groups.append(current_group)
            current_group = zone
            group_y_min = min(b["bbox"][1] for b in current_group)
            group_y_max = max(b["bbox"][3] for b in current_group)
    merged_groups.append(current_group)
    
    page_width = page.rect.width
    page_text = ""
    for group in merged_groups:
        group_text = process_zone_group(group, page_width, horizontal_threshold_ratio)
        page_text += group_text + "\n"
    
    return page_text

def process_zone_group(blocks, page_width, horizontal_threshold_ratio=0.2):
    """
    Given a list of blocks (from a merged zone), decide whether to treat them as
    one column or two columns. If the horizontal spread (max x - min x) exceeds
    horizontal_threshold_ratio * page_width, we assume a two-column layout.
    For two columns, blocks are partitioned by the median x coordinate.
    The left column is output first.
    """
    if not blocks:
        return ""
    xs = [b["bbox"][0] for b in blocks]
    if (max(xs) - min(xs)) > horizontal_threshold_ratio * page_width:
        median_x = sorted(xs)[len(xs)//2]
        left_blocks = [b for b in blocks if b["bbox"][0] < median_x]
        right_blocks = [b for b in blocks if b["bbox"][0] >= median_x]
        left_blocks = sorted(left_blocks, key=lambda b: (b["bbox"][1], b["bbox"][0]))
        right_blocks = sorted(right_blocks, key=lambda b: (b["bbox"][1], b["bbox"][0]))
        out = ""
        for block in left_blocks:
            for line in block["lines"]:
                out += " ".join(span["text"] for span in line["spans"]) + "\n"
            out += "\n"
        for block in right_blocks:
            for line in block["lines"]:
                out += " ".join(span["text"] for span in line["spans"]) + "\n"
            out += "\n"
        return out
    else:
        sorted_blocks = sorted(blocks, key=lambda b: (b["bbox"][1], b["bbox"][0]))
        out = ""
        for block in sorted_blocks:
            for line in block["lines"]:
                out += " ".join(span["text"] for span in line["spans"]) + "\n"
            out += "\n"
        return out

def extract_pdf_text(pdf_path, zone_threshold=15, horizontal_threshold_ratio=0.2):
    """
    Process the PDF file page by page using our merged zone approach.
    Returns one large string with page separators.
    """
    doc = fitz.open(pdf_path)
    full_text = ""
    for i, page in enumerate(doc):
        page_text = extract_text_from_page(page, zone_threshold, horizontal_threshold_ratio)
        full_text += f"--- Page {i+1} ---\n{page_text}\n"
    return full_text

# if __name__ == "__main__":
#     if len(sys.argv) < 2:
#         print("Usage: python advanced_pdf_extractor.py your_file.pdf")
#     else:
#         pdf_path = sys.argv[1]
#         extracted_text = extract_pdf_text(pdf_path)
#         print(extracted_text)
#         with open("extracted_text.txt", "w", encoding="utf-8") as file:
#             file.write(extracted_text)
