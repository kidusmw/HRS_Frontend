import { Link } from 'react-router-dom'
import { Separator } from '@/components/ui/separator'

export function CustomerFooter() {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">StayFinder</h3>
            <p className="text-sm text-muted-foreground">
              Find your perfect stay with ease
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground">About Us</Link></li>
              <li><Link to="/" className="hover:text-foreground">Contact</Link></li>
              <li><Link to="/" className="hover:text-foreground">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground">Help Center</Link></li>
              <li><Link to="/" className="hover:text-foreground">FAQs</Link></li>
              <li><Link to="/" className="hover:text-foreground">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground">Terms of Service</Link></li>
              <li><Link to="/" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link to="/" className="hover:text-foreground">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <Separator className="my-6" />
        <div className="text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} StayFinder. All rights reserved.</p>
          <p className="mt-2 text-xs">Phase 1 UI - Mock Data Experience</p>
        </div>
      </div>
    </footer>
  )
}

