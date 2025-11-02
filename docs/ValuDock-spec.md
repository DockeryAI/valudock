# ValuDock Specification

**Project:** ValuDock - Multi-Tenant Business Value & ROI Management Platform
**Version:** 1.0
**Last Updated:** 2025-11-01

---

## Project Overview

ValuDock is a comprehensive business value and ROI management platform designed for multi-tenant environments. It enables organizations to calculate, track, and present business value propositions with sophisticated financial modeling, risk analysis, and scenario planning capabilities.

### Technology Stack
- **Frontend:** React 18.3+ with TypeScript
- **Build Tool:** Vite 6.3+
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Real-time)
- **Authentication:** JWT-based via Supabase Auth
- **UI Framework:** Radix UI + TailwindCSS
- **Data Visualization:** Recharts
- **Additional:** Fathom API integration for meeting intelligence

---

## Phases

### Phase 1: Foundation & Governance
**Objective:** Establish project infrastructure, governance, and local development environment

**Total Steps:** 8

#### Steps:
1. **Set up local development environment**
   - Install dependencies (npm install)
   - Configure Vite dev server
   - Create missing utility files (valuedockFathomClient.ts)
   - Verify application runs locally

2. **Establish Build Runner governance**
   - Create `.runner/governance/governance.yaml`
   - Create `.runner/governance/primer.md`
   - Create `docs/ValuDock-spec.md` (this document)

3. **Configure state management**
   - Set up `state.json` in project root
   - Validate state tracking
   - Implement br-sync and br-guard commands

4. **Configure GitHub integration**
   - Verify remote repository connection
   - Set up auto-commit and push workflow
   - Validate branch protection and sync safety

5. **Supabase configuration audit**
   - Review `src/utils/supabase/info.ts`
   - Verify authentication endpoints
   - Test database connectivity

6. **Environment variables setup**
   - Create `.env` template
   - Document required environment variables
   - Set up local development secrets

7. **Test authentication flow**
   - Verify login/logout functionality
   - Test multi-tenant access controls
   - Validate global admin privileges

8. **Code quality baseline**
   - Run initial build (`npm run build`)
   - Address TypeScript errors
   - Document known issues

---

### Phase 2: Core ROI Engine
**Objective:** Ensure the core ROI calculation and data management system is robust and accurate

**Total Steps:** 10

#### Steps:
1. **Review ROI calculation logic**
   - Audit `src/components/utils/calculations.ts`
   - Validate cashflow generation
   - Test NPV and IRR calculations

2. **Input data validation**
   - Review `InputsScreenTable` component
   - Implement comprehensive data validation
   - Add error handling for edge cases

3. **Process management**
   - Audit process creation, editing, deletion
   - Ensure array handling (not counts)
   - Validate `arrayHelpers.ts` utilities

4. **Results generation**
   - Review `ResultsScreen` component
   - Verify calculations accuracy
   - Test data aggregation

5. **Scenario planning**
   - Audit `ScenarioScreen` functionality
   - Test scenario comparison
   - Validate what-if analysis

6. **Implementation timeline**
   - Review `ImplementationScreen`
   - Validate timeline calculations
   - Test dependency management

7. **ROI controller optimization**
   - Audit `src/utils/roiController.ts`
   - Optimize scheduling logic
   - Reduce redundant calculations

8. **Data persistence**
   - Test Supabase data storage
   - Validate CRUD operations
   - Ensure data integrity

9. **Export functionality**
   - Review `ExportScreen` component
   - Test PDF generation
   - Validate Excel exports

10. **Performance optimization**
    - Profile render performance
    - Optimize heavy calculations
    - Implement memoization where needed

---

### Phase 3: Multi-Tenancy & Administration
**Objective:** Perfect the multi-tenant architecture and admin capabilities

**Total Steps:** 12

#### Steps:
1. **Global Admin authentication**
   - Review `admin@dockery.ai` setup
   - Validate master_admin role
   - Test unrestricted access

2. **Tenant management**
   - Audit tenant CRUD operations
   - Test tenant isolation
   - Validate white-label settings

3. **Organization management**
   - Review organization hierarchy
   - Test org-level permissions
   - Validate user assignments

4. **User management**
   - Review user creation/editing
   - Test role-based access control
   - Validate permission inheritance

5. **Context switching**
   - Audit `TenantOrgContextSwitcher` component
   - Test switching between tenants/orgs
   - Validate data filtering

6. **Admin dashboard**
   - Review `AdminDashboard` component
   - Test all admin functions
   - Validate data presentation

7. **Assignment system**
   - Review admin assignment logic
   - Test user-to-org assignments
   - Validate tenant admin rights

8. **Access control enforcement**
   - Audit backend permission checks
   - Test RLS (Row Level Security) policies
   - Validate frontend guards

9. **API webhooks**
   - Review webhook organization
   - Test admin API endpoints
   - Validate request/response formats

10. **Profile management**
    - Review `ProfileScreen` component
    - Test profile updates
    - Validate session management

11. **Debug tools**
    - Audit `DebugConsole` component
    - Test diagnostic capabilities
    - Validate error reporting

12. **System initialization**
    - Review `/init` endpoint
    - Test first-time setup
    - Validate seed data creation

---

### Phase 4: Advanced Features & Integrations
**Objective:** Implement and refine advanced capabilities including AI, meeting intelligence, and risk analysis

**Total Steps:** 14

#### Steps:
1. **Fathom integration**
   - Complete `valuedockFathomClient.ts` implementation
   - Test meeting history generation
   - Validate challenge/goal extraction

2. **Fathom diagnostics**
   - Review `FathomDiagnostic` component
   - Test API connectivity
   - Validate data parsing

3. **Meetings panel**
   - Audit `MeetingsPanel` screen
   - Test meeting aggregation
   - Validate authentication flow

4. **AI features**
   - Review AI integration guide
   - Test AI-powered suggestions
   - Validate prompt engineering

5. **Opportunity Matrix**
   - Audit `OpportunityMatrixNPV` component
   - Test matrix positioning
   - Validate NPV calculations

6. **Risk factor analysis**
   - Review `RiskFactorLiveTest` component
   - Test risk scoring
   - Validate complexity calculations

7. **Workflow module**
   - Audit `StandaloneWorkflow` component
   - Test workflow designer
   - Validate process flows

8. **Presentation mode**
   - Review `PresentationScreen` component
   - Test presentation generation
   - Validate slide exports

9. **Timeline visualization**
   - Audit `TimelineScreen` component
   - Test Gantt-style displays
   - Validate milestone tracking

10. **Analytics dashboard**
    - Implement analytics tab
    - Add data visualization
    - Test reporting capabilities

11. **Cost classification**
    - Review cost categorization
    - Test null handling
    - Validate classification logic

12. **Invoice processing**
    - Audit invoice upload/processing
    - Test CFO score calculation
    - Validate data extraction

13. **Effort calculation**
    - Review absolute effort calculations
    - Test effort aggregation
    - Validate allocation logic

14. **Domain validation**
    - Audit `domainValidation.ts`
    - Test input sanitization
    - Validate business rules

---

### Phase 5: User Experience & Polish
**Objective:** Enhance user experience, fix bugs, and optimize performance

**Total Steps:** 10

#### Steps:
1. **UI/UX audit**
   - Review all screens for consistency
   - Test responsive design
   - Validate accessibility

2. **Component library cleanup**
   - Audit Radix UI usage
   - Remove unused components
   - Standardize patterns

3. **Error handling**
   - Implement global error boundaries
   - Add user-friendly error messages
   - Test error recovery

4. **Loading states**
   - Add loading indicators
   - Implement skeleton screens
   - Test async operations

5. **Toast notifications**
   - Audit Sonner toast usage
   - Standardize notification patterns
   - Test success/error flows

6. **Form validation**
   - Review all form inputs
   - Add client-side validation
   - Test validation messages

7. **Data grid enhancements**
   - Optimize table performance
   - Add sorting/filtering
   - Test large datasets

8. **Mobile responsiveness**
   - Test on mobile devices
   - Fix layout issues
   - Optimize touch interactions

9. **Performance profiling**
   - Use React DevTools
   - Identify bottlenecks
   - Implement optimizations

10. **Documentation cleanup**
    - Organize `.md` files
    - Archive completed tasks
    - Create user documentation

---

### Phase 6: Testing & Quality Assurance
**Objective:** Comprehensive testing and quality assurance

**Total Steps:** 8

#### Steps:
1. **Unit testing setup**
   - Configure Vitest
   - Write utility function tests
   - Test calculation logic

2. **Component testing**
   - Set up React Testing Library
   - Write component tests
   - Test user interactions

3. **Integration testing**
   - Test API integrations
   - Validate data flows
   - Test authentication

4. **E2E testing**
   - Set up Playwright/Cypress
   - Write critical path tests
   - Automate regression testing

5. **Security audit**
   - Review authentication
   - Test authorization
   - Validate input sanitization

6. **Performance testing**
   - Load testing
   - Stress testing
   - Optimization validation

7. **Cross-browser testing**
   - Test on Chrome, Firefox, Safari
   - Fix compatibility issues
   - Validate feature parity

8. **User acceptance testing**
   - Create test scenarios
   - Gather stakeholder feedback
   - Address UAT findings

---

### Phase 7: Deployment & Production Readiness
**Objective:** Prepare for production deployment and establish operational procedures

**Total Steps:** 10

#### Steps:
1. **Environment configuration**
   - Set up production environment variables
   - Configure Supabase production instance
   - Set up CDN and hosting

2. **Build optimization**
   - Optimize bundle size
   - Configure code splitting
   - Enable compression

3. **CI/CD pipeline**
   - Set up GitHub Actions
   - Automate testing
   - Configure deployment

4. **Database migrations**
   - Review schema changes
   - Create migration scripts
   - Test rollback procedures

5. **Monitoring setup**
   - Configure error tracking (Sentry)
   - Set up performance monitoring
   - Create alerting rules

6. **Backup strategy**
   - Configure database backups
   - Test restore procedures
   - Document recovery process

7. **SSL/TLS configuration**
   - Set up SSL certificates
   - Configure HTTPS
   - Test secure connections

8. **DNS and domain setup**
   - Configure domain names
   - Set up DNS records
   - Test routing

9. **Production deployment**
   - Deploy to production
   - Run smoke tests
   - Monitor initial rollout

10. **Documentation finalization**
    - Write deployment guide
    - Create runbook
    - Document troubleshooting

---

## Progress Tracking

**Current Status:** Phase 1, Step 1

**Phase Summary:**
- **Phase 1:** Foundation & Governance (8 steps)
- **Phase 2:** Core ROI Engine (10 steps)
- **Phase 3:** Multi-Tenancy & Administration (12 steps)
- **Phase 4:** Advanced Features & Integrations (14 steps)
- **Phase 5:** User Experience & Polish (10 steps)
- **Phase 6:** Testing & Quality Assurance (8 steps)
- **Phase 7:** Deployment & Production Readiness (10 steps)

**Total Phases:** 7
**Total Steps Across All Phases:** 72

---

## Success Criteria

### Phase 1 Complete When:
- [ ] Vite dev server runs without errors
- [ ] Build Runner governance files created
- [ ] State tracking operational
- [ ] GitHub sync configured
- [ ] Authentication verified

### Phase 2 Complete When:
- [ ] All ROI calculations accurate
- [ ] Data validation comprehensive
- [ ] Export functionality works
- [ ] Performance acceptable
- [ ] No calculation bugs

### Phase 3 Complete When:
- [ ] Multi-tenancy fully functional
- [ ] All admin features working
- [ ] Access control enforced
- [ ] Context switching seamless
- [ ] No permission bypasses

### Phase 4 Complete When:
- [ ] Fathom integration complete
- [ ] AI features functional
- [ ] Risk analysis accurate
- [ ] All advanced modules working
- [ ] Integration tests pass

### Phase 5 Complete When:
- [ ] UI/UX consistent across app
- [ ] No major bugs
- [ ] Performance optimized
- [ ] Mobile responsive
- [ ] User feedback positive

### Phase 6 Complete When:
- [ ] Test coverage >80%
- [ ] All critical paths tested
- [ ] Security audit passed
- [ ] Performance benchmarks met
- [ ] No high-severity issues

### Phase 7 Complete When:
- [ ] Production deployment successful
- [ ] Monitoring operational
- [ ] Backups configured
- [ ] Documentation complete
- [ ] Stakeholders signed off

---

## Notes

- This spec is a living document and should be updated as the project evolves
- Each phase can be worked on iteratively; they don't need to be 100% complete before moving forward
- Steps within a phase can be reordered based on priority
- New steps can be added as requirements emerge

---

## Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-11-01 | 1.0 | Initial specification created | Build Runner AI |
