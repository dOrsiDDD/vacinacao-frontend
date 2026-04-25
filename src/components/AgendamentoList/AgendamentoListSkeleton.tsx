import { Skeleton } from "@/components/ui/skeleton"; 

export function AgendamentoListSkeleton() {
  return (
    <div className="space-y-4 mt-4">
      {[1, 2, 3, 4].map((index) => (
        <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full" />
          
          {/* Blocos de texto */}
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-62.5" /> 
            <Skeleton className="h-4 w-50" /> 
          </div>
          
          <Skeleton className="h-8 w-20 rounded" />
        </div>
      ))}
    </div>
  );
}