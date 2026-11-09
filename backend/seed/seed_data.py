from app import app
from extensions import db
from models import Processor, GPU, Laptop, TechGlossary


def seed():
    with app.app_context():
        db.create_all()

        if Processor.query.count() == 0:
            processors = [
                Processor(name="Intel Core i5", manufacturer="Intel", category="Mid-range", performance_score=75, generation="13th Gen", explanation="A balanced processor for everyday work, education and moderate workloads."),
                Processor(name="AMD Ryzen 5", manufacturer="AMD", category="Mid-range", performance_score=76, generation="7000 Series", explanation="A balanced processor suitable for productivity and general multitasking."),
                Processor(name="Intel Core i7", manufacturer="Intel", category="High-performance", performance_score=90, generation="13th Gen", explanation="Higher performance for demanding multitasking and creative workloads."),
                Processor(name="AMD Ryzen 7", manufacturer="AMD", category="High-performance", performance_score=91, generation="7000 Series", explanation="High-performance processor for demanding workloads and heavier multitasking."),
                Processor(name="Intel Core i3", manufacturer="Intel", category="Entry-level", performance_score=55, generation="12th Gen", explanation="Suitable for basic everyday computing and lighter workloads."),
            ]
            db.session.add_all(processors)
            db.session.flush()

        if GPU.query.count() == 0:
            gpus = [
                GPU(name="Integrated Graphics", category="Integrated", performance_score=55, description="Uses processor-integrated graphics and is suitable for everyday workloads."),
                GPU(name="Basic Dedicated Graphics", category="Basic dedicated", performance_score=70, description="Dedicated graphics for light gaming and graphics workloads."),
                GPU(name="High-Performance Dedicated Graphics", category="High-performance dedicated", performance_score=92, description="Dedicated graphics intended for demanding gaming and visual workloads."),
            ]
            db.session.add_all(gpus)
            db.session.flush()

        if Laptop.query.count() == 0:
            p = {x.category: x for x in Processor.query.all()}
            g = {x.category: x for x in GPU.query.all()}
            laptops = [
                Laptop(brand="Aurelia", model="Pro 14", price=74999, processor_id=p["Mid-range"].id, gpu_id=g["Integrated"].id, ram=16, storage=512, storage_type="SSD", display_size=14.0, display_type="IPS", resolution="1920×1200", refresh_rate=60, battery="Up to 12 hours", battery_hours=12, weight=1.30, os="Windows", upgradeability="RAM upgradeable", connectivity="USB-C, USB-A, HDMI, Wi-Fi 6"),
                Laptop(brand="Northstar", model="Air 13", price=69999, processor_id=p["Mid-range"].id, gpu_id=g["Integrated"].id, ram=16, storage=256, storage_type="SSD", display_size=13.3, display_type="IPS", resolution="2560×1600", refresh_rate=60, battery="Up to 15 hours", battery_hours=15, weight=1.10, os="Windows", upgradeability="Not upgradeable", connectivity="USB-C, Wi-Fi 6"),
                Laptop(brand="Vector", model="Studio 15", price=119999, processor_id=p["High-performance"].id, gpu_id=g["High-performance dedicated"].id, ram=32, storage=1024, storage_type="SSD", display_size=15.6, display_type="IPS", resolution="2560×1600", refresh_rate=120, battery="Up to 7 hours", battery_hours=7, weight=1.90, os="Windows", upgradeability="RAM and storage upgradeable", connectivity="USB-C, USB-A, HDMI, Wi-Fi 6E"),
                Laptop(brand="Aurelia", model="Lite 15", price=57999, processor_id=p["Entry-level"].id, gpu_id=g["Integrated"].id, ram=8, storage=512, storage_type="SSD", display_size=15.6, display_type="IPS", resolution="1920×1080", refresh_rate=60, battery="Up to 6 hours", battery_hours=6, weight=1.70, os="Windows", upgradeability="RAM upgradeable", connectivity="USB-C, USB-A, HDMI, Wi-Fi 5"),
                Laptop(brand="Forge", model="G16", price=139999, processor_id=p["High-performance"].id, gpu_id=g["High-performance dedicated"].id, ram=32, storage=1024, storage_type="SSD", display_size=16.0, display_type="IPS", resolution="2560×1600", refresh_rate=165, battery="Up to 4 hours", battery_hours=4, weight=2.40, os="Windows", upgradeability="RAM and storage upgradeable", connectivity="USB-C, USB-A, HDMI, Ethernet, Wi-Fi 6E"),
                Laptop(brand="Northstar", model="Essential 14", price=51999, processor_id=p["Entry-level"].id, gpu_id=g["Integrated"].id, ram=8, storage=256, storage_type="SSD", display_size=14.0, display_type="IPS", resolution="1920×1080", refresh_rate=60, battery="Up to 10 hours", battery_hours=10, weight=1.40, os="Linux", upgradeability="Not upgradeable", connectivity="USB-C, USB-A, HDMI, Wi-Fi 5"),
            ]
            db.session.add_all(laptops)

        if TechGlossary.query.count() == 0:
            glossary = [
                TechGlossary(term="CPU", simple_description="The processor — the laptop's main component for general computing and responsiveness.", category="Performance"),
                TechGlossary(term="GPU", simple_description="The graphics processor, especially important for gaming and visual workloads.", category="Performance"),
                TechGlossary(term="RAM", simple_description="Short-term working memory that helps a laptop handle multiple tasks smoothly.", category="Performance"),
                TechGlossary(term="SSD", simple_description="Fast storage used for the operating system, applications and files.", category="Storage"),
                TechGlossary(term="OLED", simple_description="A display technology known for deep blacks and high contrast.", category="Display"),
                TechGlossary(term="IPS", simple_description="A common LCD panel type with good viewing angles and balanced image quality.", category="Display"),
                TechGlossary(term="Refresh Rate", simple_description="How many times per second the display refreshes its image, measured in Hz.", category="Display"),
                TechGlossary(term="Resolution", simple_description="The number of pixels used to form the displayed image.", category="Display"),
                TechGlossary(term="Battery Capacity", simple_description="How much electrical energy the battery can store; it helps describe battery size but does not alone determine runtime.", category="Battery"),
                TechGlossary(term="Upgradeability", simple_description="Whether components such as RAM or storage can be replaced or upgraded later.", category="Hardware"),
                TechGlossary(term="Wi-Fi", simple_description="Wireless networking technology used to connect a laptop to networks and the internet.", category="Connectivity"),
            ]
            db.session.add_all(glossary)

        db.session.commit()
        print("GadgetLens database tables and seed data are ready.")


if __name__ == "__main__":
    seed()
