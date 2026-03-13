import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Cpu, Radio, Wifi, Zap, Thermometer, Camera, Gauge, Lightbulb, ArrowRight } from "lucide-react";

const categories = [
  {
    id: "arduino",
    name: "Arduino Boards",
    description: "Official Arduino boards and compatible development kits for prototyping and production.",
    icon: Cpu,
    color: "from-blue-500 to-cyan-400",
    products: 156,
    featured: ["Arduino Uno R3", "Arduino Mega 2560", "Arduino Nano"],
  },
  {
    id: "sensors",
    name: "Sensors",
    description: "Temperature, humidity, motion, distance, and environmental sensors for IoT applications.",
    icon: Thermometer,
    color: "from-green-500 to-emerald-400",
    products: 234,
    featured: ["DHT22", "PIR Motion", "HC-SR04 Ultrasonic"],
  },
  {
    id: "wireless",
    name: "Wireless Modules",
    description: "WiFi, Bluetooth, LoRa, and RF modules for wireless communication projects.",
    icon: Wifi,
    color: "from-purple-500 to-pink-400",
    products: 89,
    featured: ["ESP32", "ESP8266", "nRF24L01"],
  },
  {
    id: "displays",
    name: "Displays & LEDs",
    description: "LCD screens, OLED displays, LED strips, and indicator lights for visual output.",
    icon: Lightbulb,
    color: "from-yellow-500 to-orange-400",
    products: 112,
    featured: ["16x2 LCD", "0.96\" OLED", "WS2812B LED Strip"],
  },
  {
    id: "motors",
    name: "Motors & Drivers",
    description: "DC motors, stepper motors, servos, and motor driver modules for robotics.",
    icon: Gauge,
    color: "from-red-500 to-rose-400",
    products: 78,
    featured: ["SG90 Servo", "L298N Driver", "NEMA 17 Stepper"],
  },
  {
    id: "power",
    name: "Power Supplies",
    description: "Batteries, power modules, voltage regulators, and charging circuits.",
    icon: Zap,
    color: "from-amber-500 to-yellow-400",
    products: 65,
    featured: ["LM7805", "18650 Battery", "Buck Converter"],
  },
  {
    id: "communication",
    name: "Communication",
    description: "UART, I2C, SPI modules, and serial communication interfaces.",
    icon: Radio,
    color: "from-indigo-500 to-blue-400",
    products: 43,
    featured: ["FT232 USB-Serial", "Logic Analyzer", "CAN Bus Module"],
  },
  {
    id: "cameras",
    name: "Cameras & Vision",
    description: "Camera modules, image sensors, and computer vision accessories.",
    icon: Camera,
    color: "from-teal-500 to-cyan-400",
    products: 28,
    featured: ["OV7670", "Raspberry Pi Camera", "Thermal Camera"],
  },
];

const CategoriesPage = () => {
  return (
    <div className="min-h-screen bg-background dark">
      <Header />
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="relative overflow-hidden py-20">
          <div className="absolute inset-0 hero-gradient" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-normal">

                Browse by <span className="text-gradient">Category</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Explore our extensive collection of electronics components organized 
                by category. Find exactly what you need for your next project.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Link
                    to={`/products?category=${category.id}`}
                    className="block h-full"
                  >
                    <div className="h-full p-6 rounded-2xl bg-card border border-border card-hover group">
                      {/* Icon */}
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                        <category.icon className="w-7 h-7 text-white" />
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {category.description}
                      </p>

                      {/* Featured Products */}
                      <div className="space-y-1 mb-4">
                        {category.featured.map((product) => (
                          <div key={product} className="text-xs text-muted-foreground flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-primary" />
                            {product}
                          </div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <span className="text-sm text-muted-foreground">
                          {category.products} products
                        </span>
                        <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Brands */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4">Popular Brands</h2>
              <p className="text-muted-foreground">
                We stock components from leading manufacturers
              </p>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-8 opacity-60">
              {["Arduino", "Raspberry Pi", "Espressif", "Texas Instruments", "STMicroelectronics", "Adafruit", "SparkFun", "Seeed Studio"].map((brand) => (
                <motion.div
                  key={brand}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="text-xl font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {brand}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CategoriesPage;
