import { Link } from 'react-router-dom';
import { ArrowRight, Users, Vote, Wallet, TrendingUp } from 'lucide-react';

const stats = [
  { label: 'Total DAOs', value: '1,234', icon: Users },
  { label: 'Active Proposals', value: '89', icon: Vote },
  { label: 'Total Value Locked', value: '$45.6M', icon: Wallet },
  { label: 'Avg Monthly ROI', value: '12.5%', icon: TrendingUp },
];

const features = [
  {
    title: 'Enhanced Governance',
    description: 'Ranked choice voting, private voting, and rage quit mechanisms for sophisticated decision-making.',
    icon: Vote,
  },
  {
    title: 'Investment Pools',
    description: 'Collective investment strategies with automated profit distribution and portfolio management.',
    icon: TrendingUp,
  },
  {
    title: 'Multi-chain Support',
    description: 'Deploy DAOs on Ethereum, Polygon, and Solana with seamless cross-chain operations.',
    icon: Wallet,
  },
  {
    title: 'No-Code Creation',
    description: 'Visual DAO creation wizard with templates and best practices built-in.',
    icon: Users,
  },
];

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Build the Future of
              <span className="text-primary-600 dark:text-primary-400"> Decentralized Governance</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Create, manage, and participate in DAOs with advanced governance features, 
              investment pools, and multi-chain support. No coding required.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/create"
                className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center gap-2"
              >
                Create Your DAO
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/explore"
                className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Explore DAOs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">+12%</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Powerful Features for Modern DAOs
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Everything you need to run a successful decentralized organization
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <feature.icon className="h-12 w-12 text-primary-600 dark:text-primary-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 dark:bg-primary-700 rounded-2xl p-12 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to Start Your DAO Journey?
        </h2>
        <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
          Join thousands of communities building the future of decentralized governance
        </p>
        <Link
          to="/create"
          className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
        >
          Get Started Now
          <ArrowRight className="h-5 w-5" />
        </Link>
      </section>
    </div>
  );
}