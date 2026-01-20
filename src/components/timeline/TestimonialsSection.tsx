import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "I get excited when I'm learning new and interesting things—especially when the experience stretches both my imagination and my intellect. Black Tech Street delivered just that: a challenging, fun, and thought-provoking event that deepened my understanding of AI and expanded my creative toolkit. From hands-on learning to meaningful conversations, I walked away inspired and empowered. I can't wait to see how this momentum fuels future community engagement and innovation with Black Tech Street. The possibilities are limitless, and I'm here for all of it.",
    author: "Angela A."
  },
  {
    quote: "Discovering what AI can do with the simplest of instructions given to it was mind-blowing for me. One little sentence could create a beautiful presentation, an app, give answers to the most random questions. It's insane!",
    author: "India M."
  },
  {
    quote: "Confidence, inspiration, and relief. That's how I feel as I'm now able to scale myself and create better outcomes.",
    author: "Michelle S."
  },
  {
    quote: "I learned not only about AI, but also about how I relate to it—and how I can integrate it into my life and work in a thoughtful, ethical way.",
    author: "Judie W."
  },
  {
    quote: "It was so inspiring and enlightening to be able to explore and learn about so many great tools!",
    author: "Michelle B."
  },
  {
    quote: "I feel that blinders have been removed.",
    author: "Nadette C."
  },
  {
    quote: "This experience taught me that there is community and help for people wanting to learn and grow businesses in the ai/tech world.",
    author: "Solei W."
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Quote className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-primary uppercase tracking-wider">Testimonials</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
          What Participants Are Saying
        </h2>
      </motion.div>

      <div className="space-y-4">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.author}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="group relative"
          >
            <div className="relative bg-card/60 backdrop-blur-sm border border-border/40 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300">
              {/* Quote icon */}
              <Quote className="h-6 w-6 text-primary/30 mb-3" />
              
              {/* Quote text */}
              <p className="text-sm md:text-base text-foreground/90 leading-relaxed mb-4 italic">
                "{testimonial.quote}"
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-primary/40" />
                <span className="text-sm font-medium text-primary">
                  {testimonial.author}
                </span>
              </div>

              {/* Subtle hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
