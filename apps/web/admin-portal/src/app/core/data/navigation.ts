import { NavigationItem } from '@whizard/shared-ui';

export const ADMIN_NAVIGATION: NavigationItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    children: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'heroicons_outline:home',
        route: '/dashboard',
      },
    ],
  },
  {
    id: 'wrcf',
    label: 'WRCF',
    children: [
      {
        id: 'industry-wrcf',
        label: 'Manage Industry',
        icon: 'heroicons_outline:building-office',
        route: '/industry-wrcf',
        activeOptions: { exact: false },
      },
      {
        id: 'wrcf-skills',
        label: 'Manage Skills',
        icon: 'lucideIcons:sparkles',
        route: '/wrcf-skills',
        activeOptions: { exact: false },
      },
      {
        id: 'wrcf-roles',
        label: 'Manage Roles',
        icon: 'heroicons_outline:users',
        route: '/wrcf-roles',
        activeOptions: { exact: false },
      },
    ],
  },
  {
    id: 'college',
    label: 'College',
    children: [
      {
        id: 'manage-college',
        label: 'Manage College',
        icon: 'heroicons_outline:academic-cap',
        route: '/manage-college',
        activeOptions: { exact: false },
      },
    ],
  },
  {
    id: 'company',
    label: 'Company',
    children: [
      {
        id: 'manage-company',
        label: 'Manage Company',
        icon: 'heroicons_outline:building-office-2',
        route: '/manage-company',
        activeOptions: { exact: false },
      },
    ],
  },
  {
    id: 'internships-management',
    label: 'Internship Management',
    children: [
      {
        id: 'manage-internship',
        label: 'Internships',
        icon: 'lucideIcons:brain-circuit',
        route: '/manage-internship',
        activeOptions: { exact: false },
      },
      {
        id: 'manage-internship-submission',
        label: 'Internships Submission',
        icon: 'lucideIcons:ticket-check',
        route: '/manage-company',
        activeOptions: { exact: false },
      },
    ],  
  },
  {
    id: 'account',
    label: 'Account',
    children: [
      {
        id: 'profile',
        label: 'Profile',
        icon: 'heroicons_outline:user',
        route: '/profile',
      },
    ],
  },
];
