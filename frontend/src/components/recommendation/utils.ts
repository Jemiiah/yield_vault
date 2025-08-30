/**
 * Get the appropriate CSS classes for risk level styling following the landing page style system
 */
export function getRiskColor(risk: string): string {
  switch (risk.toLowerCase()) {
    case "very low":
      return "bg-gradient-to-br from-green-50 to-green-100 text-green-800 dark:from-green-900/20 dark:to-green-800/20 dark:text-green-300 border-green-200 dark:border-green-800";
    case "low":
      return "bg-gradient-to-br from-[#4C545A] to-[#060E14] text-white dark:from-[#DAD9D9E5] dark:to-[#F8F7F4] dark:text-[#1A2228] border-[#EAEAEA] dark:border-[#192127]";
    case "medium":
      return "bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-800 dark:from-yellow-900/20 dark:to-yellow-800/20 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
    case "high":
      return "bg-gradient-to-br from-red-50 to-red-100 text-red-800 dark:from-red-900/20 dark:to-red-800/20 dark:text-red-300 border-red-200 dark:border-red-800";
    default:
      return "bg-gradient-to-br from-white to-[#EAEAEA] text-[#565E64] dark:from-[#10181D] dark:to-[#121A21] dark:text-[#95A0A6] border-[#EAEAEA] dark:border-[#192127]";
  }
}
