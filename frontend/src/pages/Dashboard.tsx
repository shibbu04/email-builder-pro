import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Copy } from 'lucide-react';
import { getTemplates } from '../services/api';
import { Template } from '../types';
import { useAuth } from '../context/AuthContext';

const sampleTemplates = [
  {
    id: 'welcome-email',
    title: 'Welcome Email',
    content: `
      <h1 style="text-align: center; color: #1a1a1a;">Welcome to Our Platform!</h1>
      <div style="text-align: center;">
        <img src="https://images.unsplash.com/photo-1516387938699-a93567ec168e" alt="Welcome" style="max-width: 100%; border-radius: 8px;">
      </div>
      <p>Dear [Name],</p>
      <p>We're thrilled to have you join our community! Get ready to explore all the amazing features we have to offer.</p>
      <p>Best regards,<br>The Team</p>
    `,
  },
  {
    id: 'newsletter',
    title: 'Monthly Newsletter',
    content: `
      <h1 style="text-align: center; color: #2c5282;">Monthly Newsletter</h1>
      <div style="text-align: center;">
        <img src="https://images.unsplash.com/photo-1512486130939-2c4f79935e4f" alt="Newsletter" style="max-width: 100%; border-radius: 8px;">
      </div>
      <h2>This Month's Highlights</h2>
      <ul>
        <li>Feature Update 1</li>
        <li>Community Spotlight</li>
        <li>Upcoming Events</li>
      </ul>
    `,
  },
  {
    id: 'promotion',
    title: 'Special Offer',
    content: `
      <div style="text-align: center;">
        <h1 style="color: #c53030;">Special Offer Inside! 🎉</h1>
        <img src="https://images.unsplash.com/photo-1607083206869-4c7672e72a8a" alt="Special Offer" style="max-width: 100%; border-radius: 8px;">
      </div>
      <p>Don't miss out on our biggest sale of the year!</p>
      <div style="text-align: center;">
        <a href="#" style="background-color: #c53030; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Shop Now</a>
      </div>
    `,
  },
  {
    id: 'thank-you',
    title: 'Thank You Email',
    content: `
      <div style="text-align: center;">
        <h1 style="color: #2c5282;">Thank You!</h1>
        <img src="https://images.unsplash.com/photo-1494178270175-e96de2971df9" alt="Thank You" style="max-width: 100%; border-radius: 8px;">
      </div>
      <p>Dear [Name],</p>
      <p>Thank you for your continued support. We truly appreciate your trust in us.</p>
      <p>Best wishes,<br>The Team</p>
    `,
  },
];

const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await getTemplates(true);
        setTemplates(data);
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchTemplates();
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your email templates and create new ones
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link
              to="/editor"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Link>
          </div>
        </div>

        {/* Your Templates */}
        {templates.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Your Templates</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <div
                  key={template._id}
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FileText className="h-6 w-6 text-rose-500" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {template.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Created {new Date(template.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <Link
                      to={`/editor/${template._id}`}
                      className="text-rose-600 hover:text-rose-700 font-medium text-sm"
                    >
                      Edit template
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sample Templates */}
        <div className="mt-12">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Sample Templates</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sampleTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Copy className="h-6 w-6 text-amber-500" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {template.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Sample template
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <Link
                    to={{
                      pathname: '/editor',
                      search: `?template=${template.id}`,
                    }}
                    className="text-amber-600 hover:text-amber-700 font-medium text-sm"
                  >
                    Use this template
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;