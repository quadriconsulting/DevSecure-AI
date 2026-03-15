// Author: Jeremy Quadri
import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Shield, Search, GitPullRequest, Cloud } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const Features = () => {
  const featuresRef = useRef<HTMLDivElement>(null)

  const features = [
    {
      icon: <Shield className="w-10 h-10" />,
      title: "SAST + Autonomous Remediation",
      description: "AI-powered hybrid router — OpenGrep for standard rules, Qwen3-Coder LLM for complex reasoning. Multi-agent debate (Author AI + Reviewer AI) generates and validates fixes before merge.",
      focuses: [
        "50+ language support",
        "Fail-closed deterministic verification gates",
        "Auto PRs for approved fixes"
      ]
    },
    {
      icon: <Search className="w-10 h-10" />,
      title: "Secrets & Dependency Scanning",
      description: "Automated credential and API key detection to prevent leakage. SCA analysis maps third-party vulnerabilities with EPSS/CVSS enrichment and generates remediation PRs automatically.",
      focuses: [
        "Regex + semantic secrets detection",
        "SBOM generation and dependency mapping",
        "NVD, GHSA, OSV, CISA KEV correlation"
      ]
    },
    {
      icon: <GitPullRequest className="w-10 h-10" />,
      title: "DAST + Mobile + WordPress",
      description: "Live URL target analysis for runtime vulnerabilities. APK/IPA mobile application scanning. WordPress plugin, theme, and core security assessment — all in one platform.",
      focuses: [
        "Live endpoint crawling and injection testing",
        "APK/IPA binary analysis",
        "WordPress CVE and misconfiguration detection"
      ]
    },
    {
      icon: <Cloud className="w-10 h-10" />,
      title: "IaC Security + Malware Detection",
      description: "Terraform, CloudFormation, and Kubernetes manifest scanning for misconfigurations before deployment. Advanced file and code-level malware and threat detection.",
      focuses: [
        "CIS Benchmark enforcement for IaC",
        "K8s RBAC and privilege escalation checks",
        "ML-assisted malware classification"
      ]
    }
  ]

  useGSAP(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.feature-card').forEach((card: unknown, index: number) => {
        gsap.fromTo(card as Element,
          { y: 80, opacity: 0 },
          {
            scrollTrigger: {
              trigger: card as Element,
              start: 'top 85%',
              end: 'top 60%',
              toggleActions: 'play none none none'
            },
            y: 0,
            opacity: 1,
            duration: 1,
            delay: index * 0.1,
            ease: 'power3.out'
          }
        )
      })
    }, featuresRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="features" ref={featuresRef} className="py-24 px-6 bg-obsidian">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-center mb-16">
          <span className="text-gradient">Security Engine Coverage</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="feature-card glass p-8 rounded-2xl border border-champagne/20 hover:border-champagne/50 transition-all group"
            >
              <div className="text-champagne mb-5 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
              <p className="text-gray-300 leading-relaxed mb-5 text-sm">{feature.description}</p>

              <div className="border-t border-champagne/15 pt-4">
                <ul className="space-y-1.5">
                  {feature.focuses.map((focus, focusIdx) => (
                    <li key={focusIdx} className="flex items-start gap-2.5 text-gray-400 text-xs">
                      <span className="text-champagne mt-0.5">▸</span>
                      <span>{focus}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
