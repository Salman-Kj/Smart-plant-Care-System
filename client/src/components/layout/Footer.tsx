import { Leaf, Github, Twitter, Linkedin } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-display font-bold text-xl text-primary">
              <Leaf className="h-5 w-5" />
              <span>PlantCare</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Empowering plant lovers with smart technology. Detect diseases, buy rare plants, and hire expert help.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/disease" className="hover:text-primary">Disease Detection</Link></li>
              <li><Link href="/plants" className="hover:text-primary">Marketplace</Link></li>
              <li><Link href="/gardeners" className="hover:text-primary">Expert Help</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">About Us</a></li>
              <li><a href="#" className="hover:text-primary">Careers</a></li>
              <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary"><Github className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary"><Linkedin className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Smart Plant Care. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
