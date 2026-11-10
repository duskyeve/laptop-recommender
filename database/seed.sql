USE gadgetlens;

-- Processors
INSERT INTO processors (id, name, manufacturer, category, performance_score, generation, explanation) VALUES
(1, 'Intel Core i5-1340P', 'Intel', 'Mid-range', 78, '13th Gen', 'Balanced 12-core processor ideal for everyday multitasking, productivity and moderate workloads.'),
(2, 'AMD Ryzen 5 7640U', 'AMD', 'Mid-range', 80, '7000 Series', 'Energy-efficient Zen 4 processor delivering reliable speed for modern multitasking.'),
(3, 'Intel Core i7-13700H', 'Intel', 'High-performance', 92, '13th Gen', '14-core high-performance CPU designed for content creation, heavy workloads and gaming.'),
(4, 'AMD Ryzen 7 7840HS', 'AMD', 'High-performance', 94, '7000 Series', 'High-speed 8-core, 16-thread processor optimized for demanding productivity and gaming.'),
(5, 'Intel Core i3-1215U', 'Intel', 'Entry-level', 55, '12th Gen', 'Reliable and cost-effective CPU for everyday web browsing, documents and video streaming.'),
(6, 'AMD Ryzen 3 7320U', 'AMD', 'Entry-level', 54, '7000 Series', 'Entry-level 4-core processor for students and daily essential tasks.'),
(7, 'Intel Core i9-13980HX', 'Intel', 'High-performance', 99, '13th Gen', 'Top-tier powerhouse processor for extreme gaming, 3D rendering and compilation.')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- GPUs
INSERT INTO gpus (id, name, manufacturer, category, gpu_type, performance_score, description) VALUES
(1, 'Intel Iris Xe Graphics', 'Intel', 'Integrated', 'Integrated', 55, 'Processor-integrated graphics suitable for general multimedia, HD streaming and office work.'),
(2, 'AMD Radeon 780M', 'AMD', 'Integrated', 'Integrated', 68, 'High-end integrated RDNA 3 graphics capable of casual and light esports gaming.'),
(3, 'NVIDIA GeForce RTX 3050', 'NVIDIA', 'Basic dedicated', 'Dedicated', 72, 'Entry dedicated GPU with ray tracing and DLSS, suitable for 1080p gaming and photo editing.'),
(4, 'NVIDIA GeForce RTX 4060', 'NVIDIA', 'High-performance dedicated', 'Dedicated', 90, 'High-performance Ada Lovelace GPU with 8GB VRAM for 1080p/1440p gaming and video production.'),
(5, 'NVIDIA GeForce RTX 4080', 'NVIDIA', 'High-performance dedicated', 'Dedicated', 98, 'Enthusiast-tier graphics for 4K gaming, advanced rendering and machine learning.')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Laptops
INSERT INTO laptops (id, brand, model, price, processor_id, gpu_id, ram, storage, storage_type, display_size, display_type, resolution, refresh_rate, battery, battery_hours, weight, os, upgradeability, connectivity, image_url) VALUES
(1, 'Nordic', 'Slate 14', 74999, 1, 1, 16, 512, 'SSD', 14.0, 'IPS', '1920×1200', 144, 'Up to 12 hours', 12.0, 1.30, 'Windows', 'RAM upgradeable', '2× USB-C, 1× USB-A, Wi-Fi 6', 'assets/images/laptop-1.jpg'),
(2, 'Atlas', 'Book Air 13', 68999, 2, 2, 16, 256, 'SSD', 13.3, 'IPS', '1920×1080', 60, 'Up to 15 hours', 15.0, 1.10, 'Windows', 'Not upgradeable', '2× USB-C, Wi-Fi 6', 'assets/images/laptop-2.jpg'),
(3, 'Forge', 'Ryzen Studio 15', 89999, 4, 3, 32, 1024, 'SSD', 15.6, 'OLED', '2560×1440', 120, 'Up to 7 hours', 7.0, 1.90, 'Windows', 'RAM and storage upgradeable', '1× USB-C (Thunderbolt), 2× USB-A, HDMI, Wi-Fi 6E', 'assets/images/laptop-3.jpg'),
(4, 'Kestrel', 'Edge 15', 61999, 5, 1, 8, 512, 'SSD', 15.6, 'IPS', '1920×1080', 60, 'Up to 6 hours', 6.0, 1.70, 'Windows', 'RAM upgradeable', '2× USB-A, 1× USB-C, Wi-Fi 5', 'assets/images/laptop-4.jpg'),
(5, 'Pioneer', 'GameFrame 16', 118999, 3, 4, 32, 1024, 'SSD', 16.0, 'IPS', '2560×1600', 165, 'Up to 4 hours', 4.0, 2.40, 'Windows', 'RAM and storage upgradeable', '1× USB-C (Thunderbolt), 3× USB-A, HDMI, Ethernet, Wi-Fi 6E', 'assets/images/laptop-5.jpg'),
(6, 'Willow', 'Everyday 14', 52999, 6, 1, 8, 256, 'SSD', 14.0, 'IPS', '1920×1080', 60, 'Up to 10 hours', 10.0, 1.40, 'Linux', 'Not upgradeable', '2× USB-A, 1× USB-C, Wi-Fi 5', 'assets/images/laptop-6.jpg'),
(7, 'Aurelia', 'Pro 14', 79999, 1, 1, 16, 512, 'SSD', 14.0, 'IPS', '1920×1200', 90, 'Up to 12 hours', 12.0, 1.35, 'Windows', 'RAM upgradeable', 'USB-C, USB-A, HDMI, Wi-Fi 6', 'assets/images/laptop-7.jpg'),
(8, 'Vector', 'Studio 15', 124999, 7, 4, 32, 1024, 'SSD', 15.6, 'IPS', '2560×1600', 144, 'Up to 6 hours', 6.5, 2.10, 'Windows', 'RAM and storage upgradeable', 'USB-C, USB-A, HDMI, Ethernet, Wi-Fi 6E', 'assets/images/laptop-8.jpg')
ON DUPLICATE KEY UPDATE model=VALUES(model);

-- Tech Glossary
INSERT INTO tech_glossary (id, term, simple_description, detailed_description, category) VALUES
(1, 'RAM', 'Short-term memory that helps your laptop keep active programs and data readily available.', 'Random Access Memory temporarily stores data that the CPU is actively using. More RAM lets you run more apps simultaneously without slowing down.', 'Performance'),
(2, 'SSD', 'The laptop''s storage drive. SSDs are the fast, modern standard for storing files and programs.', 'Solid State Drives use flash memory chips rather than spinning magnetic platters, enabling near-instant boot times and rapid application loading.', 'Storage'),
(3, 'CPU', 'The processor — the laptop''s main ''brain'' that determines general speed and responsiveness.', 'The Central Processing Unit carries out general instructions from applications and the operating system. Core count, clock speed and architecture determine performance.', 'Performance'),
(4, 'GPU', 'The graphics processor. Matters most for gaming, video editing, and other visual workloads.', 'The Graphics Processing Unit renders pixels, 3D geometry and video effects. Dedicated GPUs have their own VRAM and deliver significantly higher performance than integrated GPUs.', 'Performance'),
(5, 'OLED', 'A display type known for very deep blacks and vivid color, at a higher price than typical screens.', 'Organic Light Emitting Diode panels illuminate every pixel individually, delivering infinite contrast, true blacks and punchy color rendering.', 'Display'),
(6, 'IPS', 'A common, reliable display type known for accurate colors and wide viewing angles.', 'In-Plane Switching is the industry-standard LCD display technology providing balanced colors, wide viewing angles, and long-term reliability.', 'Display'),
(7, 'Refresh Rate', 'How many times per second the screen updates. Higher numbers look smoother, especially in games.', 'Measured in Hertz (Hz). While standard screens refresh 60 times per second (60 Hz), high-refresh screens (90 Hz, 120 Hz, 144 Hz+) make cursor movements, animations, and gameplay visibly smoother.', 'Display'),
(8, 'Resolution', 'The number of pixels used to form the displayed image.', 'Expressed as width × height in pixels, such as 1920×1080 (Full HD) or 2560×1600 (QHD+). Higher resolutions provide sharper text and clearer detail.', 'Display'),
(9, 'Battery Capacity', 'How much charge the battery can hold — a rough indicator of how long it can run between charges.', 'Measured in Watt-hours (Wh) or milliamp-hours (mAh). Actual runtime depends heavily on screen brightness, CPU power consumption and active workloads.', 'Battery'),
(10, 'Upgradeability', 'Whether you can add more RAM or storage yourself later, instead of being stuck with what you bought.', 'Some modern thin-and-light laptops solder memory to the motherboard. Upgradeable laptops include SODIMM memory slots or M.2 SSD slots for future upgrades.', 'Hardware'),
(11, 'Wi-Fi', 'How the laptop connects to wireless networks. Newer standards are generally faster and more reliable.', 'Wi-Fi 6 (802.11ax) and Wi-Fi 6E offer higher throughput, reduced latency and improved handling of crowded networks compared to older Wi-Fi 5 (802.11ac).', 'Connectivity'),
(12, 'Processor', 'Another name for the CPU — the component that carries out the laptop''s calculations.', 'The processor executes operating system tasks and software instructions.', 'Performance'),
(13, 'Storage', 'Where your files, apps, and operating system live long-term, even when the laptop is off.', 'Non-volatile storage retains data without power. Modern laptops use PCIe NVMe SSDs for optimal speed.', 'Storage')
ON DUPLICATE KEY UPDATE simple_description=VALUES(simple_description);

