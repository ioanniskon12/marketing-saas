/**
 * Global Loading Component for Next.js
 *
 * This file is automatically used by Next.js when a page is loading.
 * It shows different designs for dark and light modes.
 */

import LoadingPage from '../components/ui/LoadingPage';

export default function Loading() {
  return <LoadingPage message="Loading..." />;
}
