"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Search, ShoppingBag, Pause, Play } from "lucide-react"
import Image from "next/image"

const dropdownMenus = {
  Store: {
    sections: [
      {
        title: "Shop",
        items: [
          "Shop the Latest",
          "Mac",
          "iPad",
          "iPhone",
          "Apple Watch",
          "Apple Vision Pro",
          "AirPods",
          "Accessories",
        ],
      },
      {
        title: "Quick Links",
        items: ["Find a Store", "Order Status", "Apple Trade In", "Financing", "Personal Setup"],
      },
      {
        title: "Shop Special Stores",
        items: ["Education", "Business"],
      },
    ],
  },
  Mac: {
    sections: [
      {
        title: "Explore Mac",
        items: [
          "Explore All Mac",
          "MacBook Air",
          "MacBook Pro",
          "iMac",
          "Mac mini",
          "Mac Studio",
          "Mac Pro",
          "Displays",
        ],
      },
      {
        title: "Shop Mac",
        items: ["Shop Mac", "Mac Accessories", "Apple Trade In", "Financing"],
      },
      {
        title: "More from Mac",
        items: ["Mac Support", "AppleCare+ for Mac", "macOS Sonoma", "Apps by Apple", "Continuity"],
      },
    ],
  },
  iPad: {
    sections: [
      {
        title: "Explore iPad",
        items: ["Explore All iPad", "iPad Pro", "iPad Air", "iPad", "iPad mini", "Apple Pencil", "Keyboards"],
      },
      {
        title: "Shop iPad",
        items: ["Shop iPad", "iPad Accessories", "Apple Trade In", "Financing"],
      },
      {
        title: "More from iPad",
        items: ["iPad Support", "AppleCare+ for iPad", "iPadOS 17", "Apps by Apple", "iCloud+"],
      },
    ],
  },
  iPhone: {
    sections: [
      {
        title: "Explore iPhone",
        items: ["Explore All iPhone", "iPhone 15 Pro", "iPhone 15", "iPhone 14", "iPhone 13", "iPhone SE"],
      },
      {
        title: "Shop iPhone",
        items: ["Shop iPhone", "iPhone Accessories", "Apple Trade In", "Carrier Deals at Apple", "Financing"],
      },
      {
        title: "More from iPhone",
        items: ["iPhone Support", "AppleCare+ for iPhone", "iOS 17", "Apps by Apple", "iPhone Privacy"],
      },
    ],
  },
  Watch: {
    sections: [
      {
        title: "Explore Watch",
        items: [
          "Explore All Apple Watch",
          "Apple Watch Series 9",
          "Apple Watch Ultra 2",
          "Apple Watch SE",
          "Apple Watch Nike",
          "Apple Watch Hermès",
        ],
      },
      {
        title: "Shop Watch",
        items: ["Shop Apple Watch", "Apple Watch Studio", "Apple Watch Bands", "Apple Watch Accessories", "Financing"],
      },
      {
        title: "More from Watch",
        items: ["Apple Watch Support", "AppleCare+", "watchOS 10"],
      },
    ],
  },
  Vision: {
    sections: [
      {
        title: "Explore Vision",
        items: ["Explore Apple Vision Pro", "Guided Tour", "Tech Specs"],
      },
      {
        title: "Shop Vision",
        items: ["Shop Apple Vision Pro", "Apple Vision Pro Accessories", "Book a Demo", "Financing"],
      },
      {
        title: "More from Vision",
        items: ["Apple Vision Pro Support", "AppleCare+", "visionOS"],
      },
    ],
  },
  AirPods: {
    sections: [
      {
        title: "Explore AirPods",
        items: [
          "Explore All AirPods",
          "AirPods Pro 2nd generation",
          "AirPods 2nd generation",
          "AirPods 3rd generation",
          "AirPods Max",
        ],
      },
      {
        title: "Shop AirPods",
        items: ["Shop AirPods", "AirPods Accessories"],
      },
      {
        title: "More from AirPods",
        items: ["AirPods Support", "AppleCare+ for Headphones", "Apple Music"],
      },
    ],
  },
  "TV & Home": {
    sections: [
      {
        title: "Explore TV & Home",
        items: ["Explore TV & Home", "Apple TV 4K", "HomePod", "HomePod mini"],
      },
      {
        title: "Shop TV & Home",
        items: ["Shop Apple TV 4K", "Shop HomePod", "Shop HomePod mini", "Shop Siri Remote", "TV & Home Accessories"],
      },
      {
        title: "More from TV & Home",
        items: [
          "Apple TV Support",
          "HomePod Support",
          "AppleCare+",
          "Apple TV app",
          "Apple TV+",
          "Home app",
          "Apple Music",
          "Siri",
        ],
      },
    ],
  },
  Entertainment: {
    sections: [
      {
        title: "Explore Entertainment",
        items: [
          "Explore Entertainment",
          "Apple One",
          "Apple TV+",
          "Apple Music",
          "Apple Arcade",
          "Apple Fitness+",
          "Apple News+",
          "Apple Podcasts",
          "Apple Books",
          "App Store",
        ],
      },
      {
        title: "Support",
        items: ["Apple TV+ Support", "Apple Music Support"],
      },
    ],
  },
  Accessories: {
    sections: [
      {
        title: "Shop Accessories",
        items: ["Shop All Accessories", "Mac", "iPad", "iPhone", "Apple Watch", "AirPods", "TV & Home"],
      },
      {
        title: "Explore Accessories",
        items: ["Made by Apple", "Beats by Dr. Dre", "AirTag"],
      },
    ],
  },
  Support: {
    sections: [
      {
        title: "Explore Support",
        items: ["iPhone", "Mac", "iPad", "Watch", "AirPods", "Music", "TV"],
      },
      {
        title: "Get Help",
        items: ["Community", "Check Coverage", "Repair", "Contact Us"],
      },
      {
        title: "Helpful Topics",
        items: ["Get AppleCare+", "Apple ID & Password", "Billing & Subscriptions", "Find My", "Accessibility"],
      },
    ],
  },
}

export default function HomePage() {
  const [isPlaying, setIsPlaying] = useState(true)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleMouseEnter = (menu: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current)
    }
    setActiveDropdown(menu)
  }

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 100)
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-white">
          <div className="mx-auto flex h-11 max-w-[980px] items-center justify-between px-4 text-xs text-[#1d1d1f]">
            <a href="#" className="flex items-center opacity-80 hover:opacity-100 transition-opacity">
              <Image src="/apple-logo.png" alt="Apple" width={16} height={20} className="h-5 w-auto" />
            </a>
            <div className="flex items-center gap-8">
              <a
                href="#"
                className="opacity-80 hover:opacity-100 transition-opacity"
                onMouseEnter={() => handleMouseEnter("Store")}
                onMouseLeave={handleMouseLeave}
              >
                Store
              </a>
              <a
                href="#"
                className="opacity-80 hover:opacity-100 transition-opacity"
                onMouseEnter={() => handleMouseEnter("Mac")}
                onMouseLeave={handleMouseLeave}
              >
                Mac
              </a>
              <a
                href="#"
                className="opacity-80 hover:opacity-100 transition-opacity"
                onMouseEnter={() => handleMouseEnter("iPad")}
                onMouseLeave={handleMouseLeave}
              >
                iPad
              </a>
              <a
                href="#"
                className="opacity-80 hover:opacity-100 transition-opacity"
                onMouseEnter={() => handleMouseEnter("iPhone")}
                onMouseLeave={handleMouseLeave}
              >
                iPhone
              </a>
              <a
                href="#"
                className="opacity-80 hover:opacity-100 transition-opacity"
                onMouseEnter={() => handleMouseEnter("Watch")}
                onMouseLeave={handleMouseLeave}
              >
                Watch
              </a>
              <a
                href="#"
                className="opacity-80 hover:opacity-100 transition-opacity"
                onMouseEnter={() => handleMouseEnter("Vision")}
                onMouseLeave={handleMouseLeave}
              >
                Vision
              </a>
              <a
                href="#"
                className="opacity-80 hover:opacity-100 transition-opacity"
                onMouseEnter={() => handleMouseEnter("AirPods")}
                onMouseLeave={handleMouseLeave}
              >
                AirPods
              </a>
              <a
                href="#"
                className="opacity-80 hover:opacity-100 transition-opacity"
                onMouseEnter={() => handleMouseEnter("TV & Home")}
                onMouseLeave={handleMouseLeave}
              >
                TV & Home
              </a>
              <a
                href="#"
                className="opacity-80 hover:opacity-100 transition-opacity"
                onMouseEnter={() => handleMouseEnter("Entertainment")}
                onMouseLeave={handleMouseLeave}
              >
                Entertainment
              </a>
              <a
                href="#"
                className="opacity-80 hover:opacity-100 transition-opacity"
                onMouseEnter={() => handleMouseEnter("Accessories")}
                onMouseLeave={handleMouseLeave}
              >
                Accessories
              </a>
              <a
                href="#"
                className="opacity-80 hover:opacity-100 transition-opacity"
                onMouseEnter={() => handleMouseEnter("Support")}
                onMouseLeave={handleMouseLeave}
              >
                Support
              </a>
            </div>
            <div className="flex items-center gap-4">
              <button className="opacity-80 hover:opacity-100 transition-opacity">
                <Search className="h-4 w-4" />
              </button>
              <button className="opacity-80 hover:opacity-100 transition-opacity">
                <ShoppingBag className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div
          className={`absolute left-0 right-0 bg-[#f5f5f7] transition-all duration-200 ease-in-out overflow-hidden ${
            activeDropdown ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
          onMouseEnter={() => {
            if (dropdownTimeoutRef.current) {
              clearTimeout(dropdownTimeoutRef.current)
            }
          }}
          onMouseLeave={handleMouseLeave}
        >
          {activeDropdown && dropdownMenus[activeDropdown as keyof typeof dropdownMenus] && (
            <div className="mx-auto max-w-[980px] px-8 py-12">
              <div className="grid grid-cols-3 gap-16">
                {dropdownMenus[activeDropdown as keyof typeof dropdownMenus].sections.map((section, idx) => (
                  <div key={idx}>
                    <h3 className="text-xs font-semibold text-[#6e6e73] mb-3">{section.title}</h3>
                    <ul className="space-y-2.5">
                      {section.items.map((item, itemIdx) => (
                        <li key={itemIdx}>
                          <a
                            href="#"
                            className="text-2xl font-semibold text-[#1d1d1f] hover:text-[#0066cc] transition-colors"
                          >
                            {item}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen pt-11 snap-start snap-always">
        {/* Video Background */}
        <div className="absolute inset-0">
          <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted loop playsInline>
            <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/airpod-max-WbDUTEVA7cOgSLowVoY2R0MCH4D8NY.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="absolute right-8 top-20 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(0,0,0,0.5)] backdrop-blur-md text-white hover:bg-[rgba(0,0,0,0.7)] transition-colors"
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
        </button>

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-end px-8 pb-16">
          <div className="max-w-[980px] mx-auto w-full">
            <p className="text-[17px] font-semibold text-[#1d1d1f] mb-1">AirPods Max</p>
            <h1 className="text-[80px] font-semibold leading-[1.05] tracking-tight text-[#1d1d1f] mb-8">
              Symphonic boom.
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-[17px] font-semibold text-[#1d1d1f]">AED 2,099</p>
              <Button
                size="lg"
                className="rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white px-5 h-11 text-[17px] font-normal"
              >
                Buy
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Composition Section */}
      <section className="relative h-screen flex items-center justify-center bg-[#f5f5f7] snap-start snap-always overflow-hidden">
        <Image src="/digital-crown.jpg" alt="AirPods Max Digital Crown" fill className="object-cover" priority />
        <div className="absolute top-0 left-0 right-0 pt-20 text-center z-10">
          <h2 className="text-5xl md:text-6xl font-semibold text-[#1d1d1f] leading-tight">
            A radically original
            <br />
            composition.
          </h2>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="h-screen flex items-center justify-center bg-[#f5f5f7] snap-start snap-always px-3">
        <div className="w-full h-full max-w-[1400px] mx-auto flex gap-3 py-3">
          {/* Card 1 */}
          <div className="relative flex-1 h-full rounded-3xl overflow-hidden bg-white">
            <Image src="/airpods-cushions.jpg" alt="AirPods Max Cushions" fill className="object-cover" />
            <div className="absolute bottom-0 left-0 right-0 pb-12 px-8">
              <p className="text-[17px] text-[#6e6e73] leading-relaxed">
                <span className="font-semibold text-[#1d1d1f]">Cushions.</span> Crafted with acoustically engineered
                memory foam and a custom-designed mesh textile, the pillow-like softness of the ear cushions gently
                creates an immersive seal that is the foundation of incredible sound.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative flex-1 h-full rounded-3xl overflow-hidden bg-white">
            <Image src="/airpods-cups.jpg" alt="AirPods Max Cups" fill className="object-cover" />
            <div className="absolute bottom-0 left-0 right-0 pb-12 px-8">
              <p className="text-[17px] text-[#6e6e73] leading-relaxed">
                <span className="font-semibold text-[#1d1d1f]">Cups.</span> The beautifully anodized aluminum cups
                feature a revolutionary mechanism that allows each cup to rotate independently and balance pressure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Telescoping Arms Section */}
      <section className="relative h-screen flex items-center justify-center bg-[#f5f5f7] snap-start snap-always overflow-hidden">
        <Image src="/telescoping-arms.png" alt="AirPods Max Telescoping Arms" fill className="object-cover" priority />
        <div className="absolute bottom-0 left-0 right-0 pb-24 text-center z-10 px-8">
          <p className="text-[21px] text-white leading-relaxed max-w-3xl mx-auto">
            <span className="font-semibold text-white">Telescoping arms.</span> The telescoping arms smoothly extend
            from the stainless steel frame — staying where you set them for a consistent fit and seal.
          </p>
        </div>
      </section>

      {/* Smart Case Section */}
      <section className="relative h-screen flex items-center justify-center bg-[#f5f5f7] snap-start snap-always overflow-hidden">
        <Image src="/images/image.png" alt="AirPods Max Smart Case" fill className="object-cover" priority />
        <div className="absolute bottom-0 left-0 right-0 pb-24 text-center z-10 px-8">
          <p className="text-[21px] text-[#6e6e73] leading-relaxed max-w-3xl mx-auto">
            <span className="font-semibold text-[#1d1d1f]">Smart Case.</span> When stored in their soft, slim Smart
            Case, AirPods Max enter an ultra‑low‑power state that preserves charge.
          </p>
        </div>
      </section>

      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="https://v0.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-black/90 transition-colors shadow-lg"
        >
          Built using v0
        </a>
      </div>
    </div>
  )
}
