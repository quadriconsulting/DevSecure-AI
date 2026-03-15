// Author: Jeremy Quadri

const Footer = () => {
  return (
    <footer id="contact" className="relative bg-obsidianLight rounded-t-[3rem] py-14 px-6 z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="text-2xl font-serif font-bold text-champagne mb-3">DevSecure</div>
            <p className="text-gray-500 text-sm leading-relaxed">
              All-in-One Application Security SaaS. Autonomous SAST remediation and multi-agent security orchestration.
            </p>
          </div>

          <div>
            <h4 className="text-champagne font-semibold mb-4">Platform</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <a href="#chat" className="block hover:text-champagne transition-colors">AI Concierge</a>
              <a href="#features" className="block hover:text-champagne transition-colors">Capabilities</a>
              <a href="https://devsecure.com/pricing" className="block hover:text-champagne transition-colors">Pricing</a>
              <a href="https://devsecure.com/docs" className="block hover:text-champagne transition-colors">Docs</a>
            </div>
          </div>

          <div>
            <h4 className="text-champagne font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <a href="mailto:support@devsecure.com" className="block hover:text-champagne transition-colors">support@devsecure.com</a>
              <a href="https://devsecure.com/demo" className="block hover:text-champagne transition-colors">Book a Demo</a>
              <a href="https://github.com/quadriconsulting" className="block hover:text-champagne transition-colors">GitHub</a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-600">
          <p>© 2026 DevSecure. Built by <a href="https://quadri.fit" className="hover:text-champagne transition-colors">Quadri Consulting</a>. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
