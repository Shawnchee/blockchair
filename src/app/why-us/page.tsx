"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import Image from "next/image";

import "swiper/css";
import "swiper/css/pagination";

const countUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.8,
      ease: "easeOut",
    },
  }),
};

interface AnimatedCounterProps {
  target: number;
  label: string;
  suffix?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ target, label, suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const duration = 2000;

    const animateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));

      if (progress < 1) {
        window.requestAnimationFrame(animateCount);
      }
    };

    window.requestAnimationFrame(animateCount);
  }, [target]);

  return (
    <div className="text-center p-2">
      <div className="text-3xl font-bold text-teal-900 mb-1">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-teal-800 text-xs">{label}</div>
    </div>
  );
};

interface ApproachCardProps {
  title: string;
  children: React.ReactNode;
  index: number;
}

const ApproachCard: React.FC<ApproachCardProps> = ({ title, children, index }) => (
  <motion.div
    variants={countUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
    custom={index}
    className="mb-8"
  >
    <h3 className="text-xl font-bold mb-3 text-teal-900">{title}</h3>
    <div className="text-teal-800">{children}</div>
  </motion.div>
);

const TreeSymbol: React.FC = () => (
  <svg width="120" height="180" viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg">
    <motion.path 
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
      d="M60 160 L60 100" 
      stroke="#134e4a" 
      strokeWidth="6" 
      fill="none" 
    />
    <motion.path 
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1, delay: 0.8 }}
      d="M60 100 L30 70 M60 100 L90 70 M60 80 L30 50 M60 80 L90 50" 
      stroke="#134e4a" 
      strokeWidth="4" 
      fill="none" 
    />
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 1.3 }}
    >
      <circle cx="30" cy="70" r="12" fill="#0d9488" />
      <circle cx="90" cy="70" r="12" fill="#0d9488" />
      <circle cx="30" cy="50" r="10" fill="#0d9488" />
      <circle cx="90" cy="50" r="10" fill="#0d9488" />
      <circle cx="60" cy="40" r="15" fill="#0d9488" />
    </motion.g>
  </svg>
);

const testimonials = [
  {
    quote:
      'Students completing the course will learn about the key disruptive technologies powering Web3, how to apply the innovation in business and what implication the technologies will have on work, economy and society.',
    author:
      'Shawn Chee Bye, Professor of University of Western Australia Business School’s Blockchain Program',
    image: 'https://images.pexels.com/photos/12064/pexels-photo-12064.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    quote:
      'This platform has allowed us to reach donors globally with full transparency. The blockchain impact reporting is game-changing.',
    author: 'Papa John, Founder of PapaJohn',
    image: 'https://images.pexels.com/photos/17323801/pexels-photo-17323801/free-photo-of-network-rack.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    quote:
      'I Just love keyboards',
    author: 'Yuan Zhen, Tech for Good Initiative',
    image: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800&h=750&dpr=2',
  },
];

export default function BlockChairStats() {
  const metrics = [
    { value: 2085823, label: "Total Beneficiaries" },
    { value: 9815, label: "Amount Donations" },
    { value: 100, label: "Ethereum Donations Raised", suffix: " ETH" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="container mx-auto py-12 px-4"
    >
      <div className="p-6">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="flex flex-col md:flex-row items-center justify-center gap-6 mt-8"
        >
          <div className="flex-shrink-0">
            <TreeSymbol />
          </div>
          <div className="relative bg-gradient-to-br from-teal-50 to-teal-100 rounded-full w-64 h-64 flex flex-col justify-center items-center shadow-md">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                variants={countUp}
                initial="hidden"
                animate="visible"
                custom={index}
                className="mb-2 z-10"
              >
                <AnimatedCounter
                  target={metric.value}
                  label={metric.label}
                  suffix={metric.suffix || ""}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="mt-12 space-y-8">
          {[
            ["Connecting Hearts & Resources", `BlockChair bridges the gap between donors and charities through blockchain technology. We enable direct, transparent funding that eliminates middlemen and ensures 100% of your donation reaches those in need.`],
            ["Our Mission", `BlockChair was founded with a simple mission: to create a transparent, efficient, and impactful way for donors to connect with causes they care about. By leveraging blockchain technology, we've built a platform that ensures every donation makes the maximum impact.`],
            ["Building Community", `We're more than a donation platform—we're cultivating an ecosystem of change-makers. BlockChair connects like-minded donors with causes they're passionate about while enabling charities to share their stories authentically.`],
            ["Success Stories", `Since our launch, we've facilitated over 9,800 donations that have directly impacted more than 2 million beneficiaries worldwide. From funding clean water projects in rural communities to supporting education initiatives in underserved areas, our platform has enabled meaningful change.`],
            ["Transparency Report", `Our commitment to transparency extends to our own operations. Each quarter, we publish a comprehensive report detailing platform performance, donation flows, and impact metrics.`]
          ].map(([title, content], idx) => (
            <ApproachCard key={idx} title={title} index={idx + 1}>
              <p>{content}</p>
            </ApproachCard>
          ))}

          <div className="flex justify-center mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-300"
            >
              Join Our Movement
            </motion.button>
          </div>
        </div>

        <div className="w-full lg:max-w-6xl mx-auto">
          <Card className="mt-16 shadow-lg">
            <CardContent className="p-6 lg:p-8">
              <Swiper
                modules={[Pagination, Autoplay]}
                slidesPerView={1}
                pagination={{ clickable: true }}
                autoplay={{ delay: 6000 }}
                loop
                className="rounded-3xl overflow-hidden"
              >
                {testimonials.map((testimonial, idx) => (
                  <SwiperSlide key={idx}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="flex flex-col lg:flex-row bg-gray-50 rounded-3xl overflow-hidden"
                    >
                      <div className="flex-1 p-8 flex flex-col justify-center items-center text-center">
                        <div className="text-yellow-500 text-4xl mb-4">❝</div>
                        <p className="text-xl font-semibold text-gray-800 mb-4 max-w-xl">
                          {testimonial.quote}
                        </p>
                        <p className="text-sm text-gray-500 italic">
                          – {testimonial.author}
                        </p>
                      </div>
                      <motion.div
                        className="flex-1 relative min-h-[300px]"
                        initial={{ scale: 1.1 }}
                        whileHover={{ scale: 1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Image
                          src={testimonial.image}
                          alt={testimonial.author}
                          fill
                          className="object-cover"
                        />
                      </motion.div>
                    </motion.div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
