import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, User, Tag, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const BlogDetail = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const blogPosts = [
    {
      id: 1,
      title: "The Future of Railway Technology",
      excerpt: "Exploring the latest innovations shaping the future of rail transport. From AI-powered predictive maintenance to autonomous trains, discover how cutting-edge technology is revolutionizing the railway industry.",
      fullContent: `
        <h2>Introduction</h2>
        <p>The railway industry is experiencing a technological revolution that promises to transform how we think about rail transport. From AI-powered predictive maintenance to autonomous trains, cutting-edge technology is revolutionizing every aspect of railway operations.</p>
        
        <h2>AI-Powered Predictive Maintenance</h2>
        <p>Artificial intelligence is revolutionizing railway maintenance by predicting equipment failures before they occur. Machine learning algorithms analyze vast amounts of sensor data to identify patterns that indicate potential issues. This proactive approach reduces downtime, improves safety, and significantly cuts maintenance costs.</p>
        
        <h2>Autonomous Train Technology</h2>
        <p>Self-driving trains are no longer science fiction. Advanced automation systems are being deployed worldwide, offering improved punctuality, energy efficiency, and capacity. These systems use sophisticated sensors, GPS, and real-time data processing to operate trains with minimal human intervention.</p>
        
        <h2>Smart Signaling Systems</h2>
        <p>Modern signaling systems leverage IoT technology to create intelligent rail networks. These systems optimize train movements, reduce delays, and improve overall network efficiency. Real-time communication between trains and infrastructure enables dynamic scheduling and enhanced safety protocols.</p>
        
        <h2>The Role of IoT Integration</h2>
        <p>The Internet of Things is connecting every component of railway infrastructure. From tracks and switches to rolling stock and stations, IoT sensors provide continuous monitoring and data collection. This connectivity enables operators to make data-driven decisions and respond quickly to changing conditions.</p>
        
        <h2>Conclusion</h2>
        <p>As technology continues to advance, the railway industry is poised for unprecedented growth and innovation. These developments promise not only improved efficiency and safety but also a more sustainable future for rail transport. The integration of AI, automation, and IoT is creating smarter, more responsive railway systems that will serve communities for generations to come.</p>
      `,
      author: "John Smith",
      date: "March 15, 2024",
      category: "Technology",
      tags: ["Technology", "Innovation", "Future", "AI", "Automation"]
    },
    {
      id: 2,
      title: "Career Growth in Railway Industry",
      excerpt: "Tips and strategies for advancing your career in the railway sector. Whether you're just starting out or looking to climb the corporate ladder, this comprehensive guide covers essential skills, networking strategies, professional certifications, and career pathways.",
      fullContent: `
        <h2>Building a Strong Foundation</h2>
        <p>Success in the railway industry starts with a solid educational background and practical experience. Whether you're entering as an engineer, operations specialist, or technical expert, understanding the fundamentals of railway systems is crucial.</p>
        
        <h2>Essential Skills for Career Advancement</h2>
        <p>Technical expertise alone isn't enough. Successful railway professionals combine technical knowledge with soft skills like communication, leadership, and problem-solving. Project management capabilities and the ability to work in cross-functional teams are highly valued.</p>
        
        <h2>Professional Certifications and Training</h2>
        <p>Industry certifications demonstrate your commitment to professional development. Consider certifications in railway engineering, safety management, project management (PMP), or specialized technical areas. Many organizations offer sponsored training programs to help employees advance their skills.</p>
        
        <h2>Networking and Mentorship</h2>
        <p>Building relationships within the industry opens doors to opportunities. Attend industry conferences, join professional associations, and seek out mentors who can guide your career path. LinkedIn and industry-specific platforms are valuable tools for professional networking.</p>
        
        <h2>Career Pathways and Progression</h2>
        <p>The railway industry offers diverse career paths. You might start as a junior engineer and progress to senior technical roles, or transition into management positions. Some professionals specialize deeply in one area, while others develop broad expertise across multiple disciplines.</p>
        
        <h2>Staying Current with Industry Trends</h2>
        <p>The railway sector is evolving rapidly. Stay informed about new technologies, regulatory changes, and industry best practices. Continuous learning through workshops, webinars, and advanced courses keeps your skills relevant and marketable.</p>
      `,
      author: "Sarah Johnson",
      date: "March 12, 2024",
      category: "Career",
      tags: ["Career", "Growth", "Professional Development", "Tips"]
    },
    {
      id: 3,
      title: "Railway Safety Best Practices",
      excerpt: "Essential safety protocols every railway professional should know. This detailed guide covers critical safety procedures, risk assessment methodologies, emergency response protocols, and compliance requirements.",
      fullContent: `
        <h2>The Foundation of Railway Safety</h2>
        <p>Safety is paramount in railway operations. Every employee, from track workers to senior management, plays a critical role in maintaining a safe working environment. Understanding and implementing safety protocols protects both workers and passengers.</p>
        
        <h2>Critical Safety Procedures</h2>
        <p>Standard operating procedures form the backbone of railway safety. These include proper communication protocols, equipment checks, and adherence to speed limits and signals. Regular safety briefings and pre-shift meetings ensure everyone is aware of potential hazards.</p>
        
        <h2>Risk Assessment Methodologies</h2>
        <p>Effective risk management involves identifying potential hazards, evaluating their likelihood and impact, and implementing controls to mitigate risks. Regular safety audits and hazard assessments help prevent accidents before they occur.</p>
        
        <h2>Emergency Response Protocols</h2>
        <p>Being prepared for emergencies is crucial. All railway personnel should be trained in emergency procedures, including evacuation protocols, first aid, and incident reporting. Regular drills ensure that teams can respond quickly and effectively in crisis situations.</p>
        
        <h2>Compliance and Regulations</h2>
        <p>Railway operations are heavily regulated to ensure public safety. Staying compliant with national and international safety standards is not just a legal requirement—it's a moral obligation. Regular training on regulatory updates keeps teams informed and compliant.</p>
        
        <h2>Creating a Safety Culture</h2>
        <p>True safety excellence comes from fostering a culture where everyone feels responsible for safety. Encouraging reporting of near-misses, rewarding safety-conscious behavior, and maintaining open communication channels creates an environment where safety is everyone's priority.</p>
      `,
      author: "Michael Brown",
      date: "March 10, 2024",
      category: "Safety",
      tags: ["Safety", "Best Practices", "Protocols", "Training"]
    },
  ];

  const blog = blogPosts.find(post => post.id === parseInt(blogId || "0"));

  if (!blog) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          onAdvertiseClick={() => {}}
          searchQuery=""
          onSearchChange={() => {}}
          activeFilters={{
            location: [],
            jobType: [],
            experience: [],
            salaryRange: [],
            sector: [],
            companies: [],
          }}
          onFiltersChange={() => {}}
        />
        <main className="max-w-[1008px] mx-auto px-4 pt-8 pb-12">
          <p className="text-muted-foreground">Blog not found.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        onAdvertiseClick={() => {}}
        searchQuery=""
        onSearchChange={() => {}}
        activeFilters={{
          location: [],
          jobType: [],
          experience: [],
          salaryRange: [],
          sector: [],
          companies: [],
        }}
        onFiltersChange={() => {}}
      />
      
      <main className="max-w-[1008px] mx-auto px-4 pt-8 pb-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Blogs
        </button>

        <article className="prose prose-lg max-w-none">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 text-sm bg-primary/10 text-primary rounded-full">
              {blog.category}
            </span>
          </div>

          <h1 className="text-4xl font-bold mb-4 text-foreground">{blog.title}</h1>

          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{blog.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{blog.date}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {blog.tags.map((tag, index) => (
              <Badge key={index} variant="outline">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>

          <div 
            className="text-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: blog.fullContent }}
            style={{
              fontSize: '1.125rem',
              lineHeight: '1.75rem'
            }}
          />
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BlogDetail;
