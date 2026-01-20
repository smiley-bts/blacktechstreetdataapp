import { motion } from 'framer-motion';
import { Linkedin, User } from 'lucide-react';

interface TeamMember {
  name: string;
  title: string;
  bio: string;
  image?: string;
  linkedIn?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Tyrance Billingsley II",
    title: "Founder & Executive Director",
    bio: "Tyrance Billingsley II is a Tulsa-born entrepreneur, technologist, and ecosystem builder. Under his leadership, Black Tech Street has brokered a citywide alliance with Microsoft to establish 21st-century Greenwood and secured federal Tech Hubs designation with an eight-figure award. Featured in Forbes, CNN Business, and Black Enterprise, Tyrance has testified before the U.S. Senate on AI and the Future of Work and attended the historic signing of the AI Executive Order at the White House.",
    image: "/images/team/tyrance-billingsley.png",
    linkedIn: "https://www.linkedin.com/in/tyrance-billingsley-ii-ab0683123/"
  },
  {
    name: "Josephine Nelms",
    title: "Chief Operating Officer",
    bio: "Josephine Nelms leads the operational strategy, partnerships and organizational systems that power Black Tech Street's mission. With more than 15 years of experience in operations, HR and organizational leadership, she previously served as Director of Operations at Atento Capital and spent a decade with Girl Scouts of Eastern Oklahoma. A Tulsa native and University of Tulsa graduate, her leadership has earned recognition including the Atent-Awesome Leadership Award (2023) and Youth at Heart Alumnus Achievement Award (2019).",
    image: "/images/team/josephine-nelms.png",
    linkedIn: "https://www.linkedin.com/in/josephine-nelms-108b87173/"
  },
  {
    name: "Allen Collins",
    title: "Community & Logistics Manager",
    bio: "Allen Collins transforms BTS initiatives into high-impact experiences that strengthen Tulsa's innovation ecosystem. He oversees program execution, community engagements, and manages logistics while cultivating relationships with local partners. Previously, Allen held marketing and operations roles with City Year Tulsa, Hunger Free Oklahoma, and inTulsa. Active in civic leadership, he participated in Leadership Tulsa New Voices Class 12 and the TYPros Get On Board Internship.",
    image: "/images/team/allen-collins.png",
    linkedIn: "https://www.linkedin.com/in/allen-collins/"
  },
  {
    name: "Smiley Elmore III",
    title: "Communications Manager",
    bio: "Smiley Elmore III leads all organizational communications, marketing, and brand execution across digital, email, and public platforms. He directs communications for major BTS programs including the ASPIRE AI Fluency Program, the NVIDIA collaboration, and partnerships with Tulsa Innovation Labs and Microsoft. Before joining Black Tech Street, Smiley founded Eminent Media, a digital agency specializing in branding, web development, AI automation, and lead-generation systems.",
    image: "/images/team/smiley-elmore.png",
    linkedIn: "https://www.linkedin.com/in/smiley-elmore-iii/"
  }
];

export function TeamSection() {
  return (
    <section className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-medium text-primary uppercase tracking-wider">Leadership</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
          Meet the Team
        </h2>
      </motion.div>

      <div className="grid gap-8">
        {teamMembers.map((member, index) => (
          <motion.div
            key={member.name + index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group relative"
          >
            <div className="relative overflow-hidden rounded-2xl bg-card/60 backdrop-blur-sm border border-border/40 hover:border-primary/30 transition-all duration-300">
              <div className="flex flex-col md:flex-row gap-6 p-6">
                {/* Image */}
                <div className="flex-shrink-0 flex justify-center md:justify-start">
                  <div className="relative w-[80%] aspect-square max-w-[280px] md:w-40 md:h-40 lg:w-44 lg:h-44 rounded-xl overflow-hidden bg-secondary border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                    )}
                    {/* Emerald glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                    <h3 className="text-xl font-display font-bold text-foreground">
                      {member.name}
                    </h3>
                    {member.linkedIn && (
                      <a
                        href={member.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center md:justify-start gap-1.5 text-primary hover:text-primary/80 transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                        <span className="text-xs font-medium">LinkedIn</span>
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-primary font-medium mb-3">
                    {member.title}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>

              {/* Subtle gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
