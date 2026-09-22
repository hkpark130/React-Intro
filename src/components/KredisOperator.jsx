// src/components/KredisOperator.jsx
// 분리된 섹션 컴포넌트들을 조합하는 메인 컴포넌트




// 분리된 섹션 컴포넌트들 import
import {
  HeroSection,
  TechStackSection,
  BackgroundSection,
  ArchitectureSection,
  ReconcileFlowSection,
  ArchitectureDiagramsSection,
  AutoscalingDemoSection,
  FeaturesSection,
  CRDExampleSection,
  ClusterStatesSection,
  GrafanaSection,
  TroubleshootingSection,
  LessonsLearnedSection,
  ReferenceSection,
} from './kredis/KredisSections';



export default function KredisOperatorFinal() {
  return (
    <article className="project-document project-document--kredis-operator">
      <div className="project-section-slot"><HeroSection /></div>
      <div className="project-section-slot"><TechStackSection /></div>
      <div className="project-section-slot"><BackgroundSection /></div>
      <div className="project-section-slot"><ArchitectureSection /></div>
      <div className="project-section-slot"><ReconcileFlowSection /></div>
      <div className="project-section-slot"><ArchitectureDiagramsSection /></div>
      <div className="project-section-slot"><AutoscalingDemoSection /></div>
      <div className="project-section-slot"><FeaturesSection /></div>
      <div className="project-section-slot"><CRDExampleSection /></div>
      <div className="project-section-slot"><ClusterStatesSection /></div>
      <div className="project-section-slot"><GrafanaSection /></div>
      <div className="project-section-slot"><TroubleshootingSection /></div>
      <div className="project-section-slot"><LessonsLearnedSection /></div>
      <div className="project-section-slot"><ReferenceSection /></div>
    </article>
  );
}
