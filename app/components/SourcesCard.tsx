interface SourcesCardProps {
  response?: string
  isLoading?: boolean
  topPadding?: boolean
}

export default function SourcesCard({ response, isLoading, topPadding }: SourcesCardProps) {
  // Extract citations from the response text
  const getCitations = () => {
    if (!response) {
      console.log('No response provided');
      return [];
    }
    
    console.log('Full response:', response);
    const referencesMatch = response.match(/References:\s*\n([\s\S]*?)(?:\n\n|$)/);
    console.log('References match:', referencesMatch);
    
    if (!referencesMatch) return [];
    
    const citations = referencesMatch[1]
      .split('\n')
      .filter(s => s.trim())
      .map(s => s.replace(/^-\s*/, ''));
    
    console.log('Extracted citations:', citations);
    return citations;
  };

  const citations = response ? getCitations() : [];

  return (
    <div className={`px-4 ${topPadding ? "pt-4" : "mt-4"}`}>
      <div className="bg-white border border-[#E4E5E1] rounded-[8px] py-4 px-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div className="text-[16px] leading-[22px] font-oracle font-medium text-[#1A1A1A] mb-1">
          Sources
        </div>
        {citations.length > 0 ? (
          <div className="space-y-2">
            {citations.map((citation, index) => (
              <div key={index} className="text-[14px] leading-[20px] text-[#1A1A1A]">
                {citation}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-2">
            <div className="w-4 h-4 border-2 border-[#E4E5E1] border-t-[#1A1A1A] rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
} 