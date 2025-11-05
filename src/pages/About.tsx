import { motion } from "framer-motion";
import { Sparkles, MapPin, Mail, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              About AI Travel Guide
            </h1>
            <p className="text-xl text-muted-foreground">
              Your intelligent companion for seamless travel planning
            </p>
          </motion.div>

          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-8 mb-8 backdrop-blur-xl bg-card/80 border-border">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3">Our Mission</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    AI Travel Guide combines the power of artificial intelligence with real-world travel data 
                    to help you plan unforgettable journeys. We leverage Google's Gemini AI for intelligent 
                    recommendations and Foursquare's extensive places database to provide accurate, up-to-date 
                    information about destinations worldwide.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-8 mb-8 backdrop-blur-xl bg-card/80 border-border">
              <h2 className="text-2xl font-bold mb-6">What We Offer</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    icon: Sparkles,
                    title: "AI-Powered Recommendations",
                    desc: "Get personalized travel suggestions based on your preferences and interests",
                  },
                  {
                    icon: MapPin,
                    title: "Real-Time Place Data",
                    desc: "Access live information about attractions, restaurants, and hotels worldwide",
                  },
                  {
                    icon: Heart,
                    title: "Itinerary Planning",
                    desc: "Create custom day-by-day plans for your trips with AI assistance",
                  },
                  {
                    icon: MapPin,
                    title: "Interactive Maps",
                    desc: "Explore destinations visually with integrated mapping technology",
                  },
                ].map((feature, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 h-fit">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Technology */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-8 mb-8 backdrop-blur-xl bg-card/80 border-border">
              <h2 className="text-2xl font-bold mb-4">Powered By</h2>
              <div className="flex flex-wrap gap-3">
                {["Gemini AI", "Foursquare API", "Mapbox", "React", "Lovable Cloud"].map((tech) => (
                  <span
                    key={tech}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 text-sm font-medium border border-primary/30"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-8 backdrop-blur-xl bg-card/80 border-border">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Mail className="w-6 h-6 text-primary" />
                Get in Touch
              </h2>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input placeholder="Your Name" className="bg-background" />
                  <Input type="email" placeholder="Your Email" className="bg-background" />
                </div>
                <Input placeholder="Subject" className="bg-background" />
                <Textarea
                  placeholder="Your message..."
                  className="bg-background min-h-[120px]"
                />
                <Button className="w-full bg-gradient-to-r from-primary to-accent">
                  Send Message
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  This is a demo contact form (non-functional)
                </p>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;
