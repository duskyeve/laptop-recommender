import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import app
from extensions import db
from models import Processor, GPU, Laptop, TechGlossary

def seed(target_app=None):
    ctx_app = target_app or app
    with ctx_app.app_context():
        db.create_all()

        processors_data = [
            {"id": 1, "name": "Intel Core i5-1340P", "manufacturer": "Intel", "category": "Mid-range", "performance_score": 78, "generation": "13th Gen", "explanation": "Balanced 12-core processor ideal for everyday multitasking, productivity and moderate workloads."},
            {"id": 2, "name": "AMD Ryzen 5 7640U", "manufacturer": "AMD", "category": "Mid-range", "performance_score": 80, "generation": "7000 Series", "explanation": "Energy-efficient Zen 4 processor delivering reliable speed for modern multitasking."},
            {"id": 3, "name": "Intel Core i7-13700H", "manufacturer": "Intel", "category": "High-performance", "performance_score": 92, "generation": "13th Gen", "explanation": "14-core high-performance CPU designed for content creation, heavy workloads and gaming."},
            {"id": 4, "name": "AMD Ryzen 7 7840HS", "manufacturer": "AMD", "category": "High-performance", "performance_score": 94, "generation": "7000 Series", "explanation": "High-speed 8-core, 16-thread processor optimized for demanding productivity and gaming."},
            {"id": 5, "name": "Intel Core i3-1215U", "manufacturer": "Intel", "category": "Entry-level", "performance_score": 55, "generation": "12th Gen", "explanation": "Reliable and cost-effective CPU for everyday web browsing, documents and video streaming."},
            {"id": 6, "name": "AMD Ryzen 3 7320U", "manufacturer": "AMD", "category": "Entry-level", "performance_score": 54, "generation": "7000 Series", "explanation": "Entry-level 4-core processor for students and daily essential tasks."},
            {"id": 7, "name": "Intel Core i9-13980HX", "manufacturer": "Intel", "category": "High-performance", "performance_score": 99, "generation": "13th Gen", "explanation": "Top-tier powerhouse processor for extreme gaming, 3D rendering and compilation."}
        ]

        for p_data in processors_data:
            existing = db.session.get(Processor, p_data["id"])
            if not existing:
                proc = Processor(**p_data)
                db.session.add(proc)
        db.session.commit()

        gpus_data = [
            {"id": 1, "name": "Intel Iris Xe Graphics", "manufacturer": "Intel", "category": "Integrated", "gpu_type": "Integrated", "performance_score": 55, "description": "Processor-integrated graphics suitable for general multimedia, HD streaming and office work."},
            {"id": 2, "name": "AMD Radeon 780M", "manufacturer": "AMD", "category": "Integrated", "gpu_type": "Integrated", "performance_score": 68, "description": "High-end integrated RDNA 3 graphics capable of casual and light esports gaming."},
            {"id": 3, "name": "NVIDIA GeForce RTX 3050", "manufacturer": "NVIDIA", "category": "Basic dedicated", "gpu_type": "Dedicated", "performance_score": 72, "description": "Entry dedicated GPU with ray tracing and DLSS, suitable for 1080p gaming and photo editing."},
            {"id": 4, "name": "NVIDIA GeForce RTX 4060", "manufacturer": "NVIDIA", "category": "High-performance dedicated", "gpu_type": "Dedicated", "performance_score": 90, "description": "High-performance Ada Lovelace GPU with 8GB VRAM for 1080p/1440p gaming and video production."},
            {"id": 5, "name": "NVIDIA GeForce RTX 4080", "manufacturer": "NVIDIA", "category": "High-performance dedicated", "gpu_type": "Dedicated", "performance_score": 98, "description": "Enthusiast-tier graphics for 4K gaming, advanced rendering and machine learning."}
        ]

        for g_data in gpus_data:
            existing = db.session.get(GPU, g_data["id"])
            if not existing:
                gpu = GPU(**g_data)
                db.session.add(gpu)
        db.session.commit()

        laptops_data = [
            {"id": 1, "brand": "Nordic", "model": "Slate 14", "price": 74999, "processor_id": 1, "gpu_id": 1, "ram": 16, "storage": 512, "storage_type": "SSD", "display_size": 14.0, "display_type": "IPS", "resolution": "1920×1200", "refresh_rate": 144, "battery": "Up to 12 hours", "battery_hours": 12.0, "weight": 1.30, "os": "Windows", "upgradeability": "RAM upgradeable", "connectivity": "2× USB-C, 1× USB-A, Wi-Fi 6", "image_url": "assets/images/laptop-1.jpg"},
            {"id": 2, "brand": "Atlas", "model": "Book Air 13", "price": 68999, "processor_id": 2, "gpu_id": 2, "ram": 16, "storage": 256, "storage_type": "SSD", "display_size": 13.3, "display_type": "IPS", "resolution": "1920×1080", "refresh_rate": 60, "battery": "Up to 15 hours", "battery_hours": 15.0, "weight": 1.10, "os": "Windows", "upgradeability": "Not upgradeable", "connectivity": "2× USB-C, Wi-Fi 6", "image_url": "assets/images/laptop-2.jpg"},
            {"id": 3, "brand": "Forge", "model": "Ryzen Studio 15", "price": 89999, "processor_id": 4, "gpu_id": 3, "ram": 32, "storage": 1024, "storage_type": "SSD", "display_size": 15.6, "display_type": "OLED", "resolution": "2560×1440", "refresh_rate": 120, "battery": "Up to 7 hours", "battery_hours": 7.0, "weight": 1.90, "os": "Windows", "upgradeability": "RAM and storage upgradeable", "connectivity": "1× USB-C (Thunderbolt), 2× USB-A, HDMI, Wi-Fi 6E", "image_url": "assets/images/laptop-3.jpg"},
            {"id": 4, "brand": "Kestrel", "model": "Edge 15", "price": 61999, "processor_id": 5, "gpu_id": 1, "ram": 8, "storage": 512, "storage_type": "SSD", "display_size": 15.6, "display_type": "IPS", "resolution": "1920×1080", "refresh_rate": 60, "battery": "Up to 6 hours", "battery_hours": 6.0, "weight": 1.70, "os": "Windows", "upgradeability": "RAM upgradeable", "connectivity": "2× USB-A, 1× USB-C, Wi-Fi 5", "image_url": "assets/images/laptop-4.jpg"},
            {"id": 5, "brand": "Pioneer", "model": "GameFrame 16", "price": 118999, "processor_id": 3, "gpu_id": 4, "ram": 32, "storage": 1024, "storage_type": "SSD", "display_size": 16.0, "display_type": "IPS", "resolution": "2560×1600", "refresh_rate": 165, "battery": "Up to 4 hours", "battery_hours": 4.0, "weight": 2.40, "os": "Windows", "upgradeability": "RAM and storage upgradeable", "connectivity": "1× USB-C (Thunderbolt), 3× USB-A, HDMI, Ethernet, Wi-Fi 6E", "image_url": "assets/images/laptop-5.jpg"},
            {"id": 6, "brand": "Willow", "model": "Everyday 14", "price": 52999, "processor_id": 6, "gpu_id": 1, "ram": 8, "storage": 256, "storage_type": "SSD", "display_size": 14.0, "display_type": "IPS", "resolution": "1920×1080", "refresh_rate": 60, "battery": "Up to 10 hours", "battery_hours": 10.0, "weight": 1.40, "os": "Linux", "upgradeability": "Not upgradeable", "connectivity": "2× USB-A, 1× USB-C, Wi-Fi 5", "image_url": "assets/images/laptop-6.jpg"},
            {"id": 7, "brand": "Aurelia", "model": "Pro 14", "price": 79999, "processor_id": 1, "gpu_id": 1, "ram": 16, "storage": 512, "storage_type": "SSD", "display_size": 14.0, "display_type": "IPS", "resolution": "1920×1200", "refresh_rate": 90, "battery": "Up to 12 hours", "battery_hours": 12.0, "weight": 1.35, "os": "Windows", "upgradeability": "RAM upgradeable", "connectivity": "USB-C, USB-A, HDMI, Wi-Fi 6", "image_url": "assets/images/laptop-7.jpg"},
            {"id": 8, "brand": "Vector", "model": "Studio 15", "price": 124999, "processor_id": 7, "gpu_id": 4, "ram": 32, "storage": 1024, "storage_type": "SSD", "display_size": 15.6, "display_type": "IPS", "resolution": "2560×1600", "refresh_rate": 144, "battery": "Up to 6 hours", "battery_hours": 6.5, "weight": 2.10, "os": "Windows", "upgradeability": "RAM and storage upgradeable", "connectivity": "USB-C, USB-A, HDMI, Ethernet, Wi-Fi 6E", "image_url": "assets/images/laptop-8.jpg"}
        ]

        for l_data in laptops_data:
            existing = db.session.get(Laptop, l_data["id"])
            if not existing:
                lap = Laptop(**l_data)
                db.session.add(lap)
        db.session.commit()

        glossary_data = [
            {"term": "RAM", "simple_description": "Short-term memory that helps your laptop keep active programs and data readily available.", "detailed_description": "Random Access Memory temporarily stores data that the CPU is actively using. More RAM lets you run more apps simultaneously without slowing down.", "category": "Performance"},
            {"term": "SSD", "simple_description": "The laptop's storage drive. SSDs are the fast, modern standard for storing files and programs.", "detailed_description": "Solid State Drives use flash memory chips rather than spinning magnetic platters, enabling near-instant boot times and rapid application loading.", "category": "Storage"},
            {"term": "CPU", "simple_description": "The processor — the laptop's main 'brain' that determines general speed and responsiveness.", "detailed_description": "The Central Processing Unit carries out general instructions from applications and the operating system. Core count, clock speed and architecture determine performance.", "category": "Performance"},
            {"term": "GPU", "simple_description": "The graphics processor. Matters most for gaming, video editing, and other visual workloads.", "detailed_description": "The Graphics Processing Unit renders pixels, 3D geometry and video effects. Dedicated GPUs have their own VRAM and deliver significantly higher performance than integrated GPUs.", "category": "Performance"},
            {"term": "OLED", "simple_description": "A display type known for very deep blacks and vivid color, at a higher price than typical screens.", "detailed_description": "Organic Light Emitting Diode panels illuminate every pixel individually, delivering infinite contrast, true blacks and punchy color rendering.", "category": "Display"},
            {"term": "IPS", "simple_description": "A common, reliable display type known for accurate colors and wide viewing angles.", "detailed_description": "In-Plane Switching is the industry-standard LCD display technology providing balanced colors, wide viewing angles, and long-term reliability.", "category": "Display"},
            {"term": "Refresh Rate", "simple_description": "How many times per second the screen updates. Higher numbers look smoother, especially in games.", "detailed_description": "Measured in Hertz (Hz). While standard screens refresh 60 times per second (60 Hz), high-refresh screens (90 Hz, 120 Hz, 144 Hz+) make cursor movements, animations, and gameplay visibly smoother.", "category": "Display"},
            {"term": "Resolution", "simple_description": "The number of pixels used to form the displayed image.", "detailed_description": "Expressed as width × height in pixels, such as 1920×1080 (Full HD) or 2560×1600 (QHD+). Higher resolutions provide sharper text and clearer detail.", "category": "Display"},
            {"term": "Battery Capacity", "simple_description": "How much charge the battery can hold — a rough indicator of how long it can run between charges.", "detailed_description": "Measured in Watt-hours (Wh) or milliamp-hours (mAh). Actual runtime depends heavily on screen brightness, CPU power consumption and active workloads.", "category": "Battery"},
            {"term": "Upgradeability", "simple_description": "Whether components such as RAM or storage can be replaced or upgraded later.", "detailed_description": "Some modern thin-and-light laptops solder memory to the motherboard. Upgradeable laptops include SODIMM memory slots or M.2 SSD slots for future upgrades.", "category": "Hardware"},
            {"term": "Wi-Fi", "simple_description": "How the laptop connects to wireless networks. Newer standards are generally faster and more reliable.", "detailed_description": "Wi-Fi 6 (802.11ax) and Wi-Fi 6E offer higher throughput, reduced latency and improved handling of crowded networks compared to older Wi-Fi 5 (802.11ac).", "category": "Connectivity"},
            {"term": "Processor", "simple_description": "Another name for the CPU — the component that carries out the laptop's calculations.", "detailed_description": "The processor executes operating system tasks and software instructions.", "category": "Performance"},
            {"term": "Storage", "simple_description": "Where your files, apps, and operating system live long-term, even when the laptop is off.", "detailed_description": "Non-volatile storage retains data without power. Modern laptops use PCIe NVMe SSDs for optimal speed.", "category": "Storage"}
        ]

        for g_term in glossary_data:
            existing = TechGlossary.query.filter_by(term=g_term["term"]).first()
            if not existing:
                term = TechGlossary(**g_term)
                db.session.add(term)
        db.session.commit()

        print("GadgetLens database tables and seed data are ready.")

if __name__ == "__main__":
    seed()
