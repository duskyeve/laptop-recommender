"""
Chatbot service for GadgetLens.
Answers technical questions regarding hardware specifications (CPU, RAM, SSD, GPU, Display, etc.)
Strictly refuses to recommend or rank laptops.
"""

try:
    from models import TechGlossary
except ImportError:
    from ..models import TechGlossary

HARDWARE_KNOWLEDGE = {
    "ram": "RAM (Random Access Memory) provides fast short-term working memory for active applications. For basic web browsing and office documents, 8 GB is sufficient. For multitasking, programming, and moderate gaming, 16 GB is recommended. For video editing, 3D modeling, or heavy simulations, 32 GB or more is ideal.",
    "ssd": "An SSD (Solid State Drive) uses flash memory to store your files, apps, and operating system. Unlike mechanical hard drives (HDDs), SSDs have no moving parts, making them much faster, quieter, and more resistant to drops. Most modern laptops use PCIe NVMe SSDs.",
    "hdd": "An HDD (Hard Disk Drive) uses spinning magnetic platters to store data. They are slower than SSDs and mostly used today for high-capacity external storage or archival backup.",
    "cpu": "The CPU (Central Processing Unit) or processor is the core computational engine of your laptop. It handles operating system logic and application calculations. Performance depends on core count, clock speed, cache, and architectural efficiency.",
    "processor": "A processor (CPU) performs the calculations required by software. Entry-level processors (e.g. Intel Core i3, AMD Ryzen 3) handle day-to-day office tasks; mid-range chips (Core i5, Ryzen 5) excel at productivity and multitasking; high-performance chips (Core i7/i9, Ryzen 7/9) power demanding games and creator applications.",
    "gpu": "The GPU (Graphics Processing Unit) specializes in rendering 2D/3D graphics, visual effects, and parallel mathematical calculations. Integrated GPUs share system RAM and are great for battery life and normal tasks, while dedicated GPUs (such as NVIDIA GeForce) provide discrete VRAM and high compute power for gaming and video editing.",
    "graphics": "Graphics processing is handled either by integrated GPUs (built into the CPU for high battery efficiency) or dedicated GPUs (discrete cards with dedicated VRAM for gaming and visual rendering).",
    "refresh rate": "Refresh rate is how many times per second the display updates its image, measured in Hertz (Hz). 60 Hz is standard. Higher refresh rates like 90 Hz, 120 Hz, or 144 Hz+ make scrolling, animations, and gameplay feel visibly smoother and more responsive.",
    "oled": "OLED (Organic Light Emitting Diode) displays illuminate each pixel individually. This delivers infinite contrast, true deep blacks, and vibrant colors, though they can consume more power when displaying bright white screens.",
    "ips": "IPS (In-Plane Switching) is a popular LCD screen technology that offers broad viewing angles, consistent color accuracy, and reliable longevity.",
    "resolution": "Display resolution is the pixel grid that creates the on-screen image. 1920×1080 (Full HD) is standard for 13–15 inch laptops. 2560×1440 or 2560×1600 (QHD/2K) provides noticeably sharper text, and 3840×2160 (4K) offers ultra-crisp detail at the cost of higher battery draw.",
    "battery": "Laptop battery life depends on battery capacity (in Watt-hours) combined with processor efficiency, screen brightness, and the intensity of active software tasks.",
    "upgradeability": "Upgradeability refers to whether you can replace or expand internal components like RAM and SSD storage after purchasing the laptop. Soldered components cannot be changed, while laptops with SO-DIMM and M.2 slots allow easy future upgrades.",
    "wifi": "Wi-Fi is the wireless networking standard. Wi-Fi 6 (802.11ax) and Wi-Fi 6E provide higher transfer speeds, lower latency, and better reliability on crowded home or office networks compared to older Wi-Fi 5.",
}

def answer_technical_question(question: str) -> str:
    """
    Answers a technical inquiry.
    Refuses laptop recommendation / ranking requests.
    Checks database glossary and knowledge base.
    """
    if not question or not question.strip():
        return "Please ask a technical question about laptop components (e.g., RAM, SSD, CPU, GPU, display, or refresh rate)."

    q = question.strip().lower()

    # Rejection of recommendation/ranking questions
    prohibited_keywords = ["which laptop", "what laptop", "recommend me", "best laptop", "should i buy", "which one is better", "rank laptops"]
    if any(keyword in q for keyword in prohibited_keywords):
        return (
            "I cannot recommend, pick, or rank specific laptops — that is the job of GadgetLens's "
            "deterministic recommendation engine based on your personal priorities. "
            "However, I can explain any technical specification (such as RAM, SSD, CPU, GPU, or refresh rate)!"
        )

    # Check database glossary first
    try:
        glossary_items = TechGlossary.query.all()
        for item in glossary_items:
            term_lower = item.term.lower()
            if term_lower in q:
                desc = item.detailed_description or item.simple_description
                return f"**{item.term}**: {desc}"
    except Exception:
        pass

    # Check hardware knowledge dictionary
    for key, explanation in HARDWARE_KNOWLEDGE.items():
        if key in q:
            return explanation

    return (
        "I can answer technical questions about laptop hardware specifications, such as RAM, SSD, CPU, "
        "integrated vs. dedicated GPU, IPS vs. OLED displays, refresh rates, and upgradeability. "
        "Try asking: 'What is the difference between IPS and OLED?' or 'How much RAM do I need?'"
    )
