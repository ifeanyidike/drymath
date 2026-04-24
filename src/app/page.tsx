import Link from 'next/link'
import { Button } from '@/components/ui'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { getCurrentUser } from '@/actions/auth'
import prisma from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'

export default async function HomePage() {
  const user = await getCurrentUser()

  const servicesData = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      items: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        take: 6,
      },
    },
  })

  // Serialize Decimal to number to avoid serialization errors
  const services = servicesData.map(service => ({
    ...service,
    items: service.items.map(item => ({
      ...item,
      price: Number(item.price),
    })),
  }))

  const features = [
    {
      title: 'Free Pickup & Delivery',
      description: 'We come to you. Schedule a time that works for your schedule.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
    },
    {
      title: '48-Hour Turnaround',
      description: 'Quick service without compromising on quality or care.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Garment Insurance',
      description: 'Your clothes are insured and handled with professional care.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: 'Expert Cleaning',
      description: 'Trained professionals using premium eco-friendly products.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />

      <main className="flex-1">
        {/* Hero Section with Video Background */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          {/* Video Background */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1545173168-9f1947eebb7f?q=80&w=2071"
          >
            <source
              src="https://assets.mixkit.co/videos/20241/20241-720.mp4"
              type="video/mp4"
            />
          </video>

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/70 to-slate-900/90" />

          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 via-transparent to-green-900/20" />

          {/* Content */}
          <div className="relative z-10 mx-auto max-w-6xl px-6 py-32 w-full">
            <div className="max-w-3xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight opacity-0 animate-fade-in-up">
                We handle the laundry.
                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                  You enjoy the time.
                </span>
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-slate-300 leading-relaxed max-w-xl opacity-0 animate-fade-in-up delay-100">
                Premium laundry and dry cleaning services with free pickup and delivery.
                Schedule online and let us take care of the rest.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4 opacity-0 animate-fade-in-up delay-200">
                <Link href={user ? "/services" : "/register"}>
                  <Button size="lg" className="w-full sm:w-auto btn-shine px-8 h-14 text-base shadow-lg shadow-green-600/25 hover:shadow-green-600/40 transition-all">
                    {user ? "Schedule Pickup" : "Get Started Free"}
                  </Button>
                </Link>
                <Link href="#pricing">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 h-14 text-base bg-white/20 border-white/40 text-white hover:bg-white/30 hover:border-white/60 transition-all">
                    View Pricing
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4 text-sm text-slate-400 opacity-0 animate-fade-in-up delay-300">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Free pickup & delivery
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  48-hour turnaround
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Satisfaction guaranteed
                </span>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in delay-500">
            <a href="#how-it-works" className="flex flex-col items-center gap-2 text-white/40 hover:text-white/60 transition-colors">
              <span className="text-xs uppercase tracking-widest">Scroll</span>
              <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
                <div className="w-1 h-2 bg-white/40 rounded-full animate-bounce" />
              </div>
            </a>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-1/3 h-full gradient-mesh opacity-50" />

          <div className="mx-auto max-w-6xl px-6 relative">
            <div className="text-center mb-16">
              <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Simple Process</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-4">
                How It Works
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Getting your laundry done has never been easier. Three simple steps to fresh, clean clothes.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {[
                {
                  step: '01',
                  title: 'Schedule Pickup',
                  description: 'Choose a convenient time slot for us to collect your laundry from your doorstep.',
                },
                {
                  step: '02',
                  title: 'We Clean',
                  description: 'Your clothes are professionally cleaned with care using premium products.',
                },
                {
                  step: '03',
                  title: 'We Deliver',
                  description: 'Fresh, clean clothes delivered back to you, ready to wear.',
                },
              ].map((item, index) => (
                <div key={item.step} className="relative group">
                  {/* Connector line */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-green-200 to-transparent" />
                  )}

                  <div className="relative bg-white rounded-2xl p-8 border border-slate-100 hover:border-green-200 hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300 card-hover">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-green-500/25">
                      <span className="text-xl font-bold text-white">{item.step}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services & Pricing */}
        <section id="pricing" className="py-24 bg-slate-50 gradient-mesh">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center mb-16">
              <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Pricing</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-4">
                Transparent Pricing
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                No hidden fees. Just honest, straightforward pricing for quality service.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {services.map((service, index) => (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 card-hover"
                >
                  <div className={`px-6 py-6 ${index === 0 ? 'bg-gradient-to-r from-green-600 to-green-500' : 'bg-gradient-to-r from-slate-800 to-slate-700'}`}>
                    <h3 className="text-xl font-semibold text-white">{service.name}</h3>
                    <p className="text-sm text-white/70 mt-1">{service.description}</p>
                  </div>

                  <div className="p-6">
                    <div className="divide-y divide-slate-100">
                      {service.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                          <span className="text-slate-700">{item.name}</span>
                          <span className="font-semibold text-slate-900">
                            {formatCurrency(item.price)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Link href={`/services?service=${service.slug}`} className="block mt-6">
                      <Button variant="outline" className="w-full hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-all">
                        View All Prices
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center mb-16">
              <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Why Choose Us</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-4">
                Quality Service You Can Trust
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                We&apos;re committed to delivering the best laundry experience possible.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group p-6 rounded-2xl bg-slate-50 hover:bg-green-50 border border-transparent hover:border-green-200 transition-all duration-300 card-hover"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-5 group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-600/20 rounded-full blur-3xl" />
          </div>

          <div className="mx-auto max-w-4xl px-6 text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Simplify Your Laundry?
            </h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Join thousands of satisfied customers who have made laundry day stress-free.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={user ? "/services" : "/register"}>
                <Button size="lg" className="btn-shine px-10 h-14 text-base shadow-lg shadow-green-500/25">
                  {user ? "Schedule Pickup" : "Get Started Free"}
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline" size="lg" className="px-10 h-14 text-base bg-white/20 border-white/40 text-white hover:bg-white/30 hover:border-white/60 transition-all">
                  View All Services
                </Button>
              </Link>
            </div>
            <p className="text-slate-400 text-sm mt-6">
              No credit card required • Free pickup scheduling
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
