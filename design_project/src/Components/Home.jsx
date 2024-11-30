import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Code,
  Users,
  FileCode,
  CheckCircle,
  Brain,
  Shield,
  Terminal,
  Laptop,
} from "lucide-react";

const CodeLab = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: "Dual User Roles",
      description:
        "Specialized interfaces for both authors and students, providing tailored experiences for creating and solving programming challenges.",
    },
    {
      icon: <FileCode className="w-8 h-8 text-purple-600" />,
      title: "Comprehensive Question Bank",
      description:
        "Authors can create detailed programming questions with examples, constraints, and test cases to ensure quality learning material.",
    },
    {
      icon: <Terminal className="w-8 h-8 text-purple-600" />,
      title: "Integrated Code Editor",
      description:
        "Feature-rich code editor powered by Judge0, providing a seamless environment for writing and testing C programs.",
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-purple-600" />,
      title: "Automated Evaluation",
      description:
        "Instant feedback through automated test case validation, helping students identify and fix issues in their code.",
    },
    {
      icon: <Shield className="w-8 h-8 text-purple-600" />,
      title: "Secure Authentication",
      description:
        "JWT-based authentication system ensuring secure access and personalized experiences for all users.",
    },
    {
      icon: <Brain className="w-8 h-8 text-purple-600" />,
      title: "Learning-Focused Design",
      description:
        "Distraction-free interface optimized for learning and practicing C programming concepts.",
    },
  ];

  const roles = [
    {
      title: "For Authors",
      icon: <Laptop className="w-12 h-12 text-purple-600" />,
      features: [
        "Create and manage programming questions",
        "Set up comprehensive test cases",
        "Provide solution code validation",
        "Monitor student progress",
        "Edit and update content",
        "Access analytics dashboard",
      ],
    },
    {
      title: "For Students",
      icon: <Terminal className="w-12 h-12 text-purple-600" />,
      features: [
        "Access curated programming challenges",
        "Write and test code in real-time",
        "Get instant feedback on submissions",
        "Track learning progress",
        "Practice with example test cases",
        "Learn from verified solutions",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header with Navigation */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-purple-600">Code Lab</h1>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <button
                  onClick={() => navigate("/authorLogin")}
                  className="bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600 transition"
              >
                Author
              </button>
            </li>
            <li>
              <button
                  onClick={() => navigate("/login")}
                  className="bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600 transition"
              >
                Student
              </button>
            </li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center">
          <div className="w-1/2 pr-8 ml-48">
            <h2 className="text-5xl font-bold mb-6">
              <span className="text-purple-600">A New Way To</span>
              <br />
              <span className="text-gray-800">Learn</span>
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Our Platform Is Designed To Sharpen Your Problem-Solving Skills,
              Broaden Your Understanding, And Prepare You For Coding
              Assessments.
            </p>
          </div>
          <div className="w-1/2">
            <img
              src="/aadmi.png"
              alt="Student reading a book"
              className="rounded-lg"
            />
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
          Platform Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* User Roles Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
          Who It's For
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {roles.map((role, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200"
            >
              <div className="flex items-center gap-4 mb-6">
                {role.icon}
                <h3 className="text-2xl font-semibold text-gray-800">
                  {role.title}
                </h3>
              </div>
              <ul className="space-y-3">
                {role.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="bg-purple-600 text-white rounded-xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Coding?</h2>
          <p className="text-lg text-purple-100 mb-8">
            Join CodeLab today and take your C programming skills to the next
            level.
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="px-8 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Sign Up Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default CodeLab;
