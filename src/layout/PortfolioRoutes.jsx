import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Intro from '../components/Intro';

const Profile = lazy(() => import('../components/Profile'));
const SpringBoot = lazy(() => import('../components/SpringBoot'));
const Python = lazy(() => import('../components/Python'));
const Golang = lazy(() => import('../components/Golang'));
const Terraform = lazy(() => import('../components/Terraform'));
const Opensearch = lazy(() => import('../components/Opensearch'));
const Redmine = lazy(() => import('../components/Redmine'));
const Chrome = lazy(() => import('../components/Chrome'));
const ChatBot = lazy(() => import('../components/ChatBot'));
const KredisOperator = lazy(() => import('../components/KredisOperator'));
const OpenStackBuild = lazy(() => import('../components/OpenStackBuild'));
const NotFound = lazy(() => import('../components/NotFound'));

function lazyReview(loadData) {
  return lazy(async () => {
    const [{ default: Review }, reviews] = await Promise.all([
      import('../components/section/ProjectReview'), loadData(),
    ]);
    return { default: function RouteReview({ path }) { return <Review key={path} review={reviews[path]} />; } };
  });
}

const SiteReview = lazyReview(() => import('../data/reviews/siteProjectReviews').then(module => module.siteProjectReviews));
const AuthReview = lazyReview(() => import('../data/reviews/authProjectReviews').then(module => module.authProjectReviews));
const InfraReview = lazyReview(() => import('../data/reviews/infraProjectReviews').then(module => module.infraProjectReviews));

function project(Page, Review, path) {
  return <><Page /><Suspense fallback={null}><Review path={path} /></Suspense></>;
}

export default function PortfolioRoutes() {
  return <Routes>
    <Route path="/" element={project(Intro, SiteReview, '/')} />
    <Route path="/openstack" element={project(OpenStackBuild, InfraReview, '/openstack')} />
    <Route path="/springboot" element={project(SpringBoot, AuthReview, '/springboot')} />
    <Route path="/python" element={project(Python, SiteReview, '/python')} />
    <Route path="/golang" element={project(Golang, AuthReview, '/golang')} />
    <Route path="/terraform" element={project(Terraform, InfraReview, '/terraform')} />
    <Route path="/opensearch" element={project(Opensearch, InfraReview, '/opensearch')} />
    <Route path="/redmine" element={project(Redmine, InfraReview, '/redmine')} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/chrome" element={project(Chrome, AuthReview, '/chrome')} />
    <Route path="/chatbot" element={<ChatBot />} />
    <Route path="/kredis" element={project(KredisOperator, InfraReview, '/kredis')} />
    <Route path="/projects" element={<Navigate to="/" replace />} />
    <Route path="/cicd" element={<Navigate to="/blog/55" replace />} />
    <Route path="*" element={<NotFound />} />
  </Routes>;
}
