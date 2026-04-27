import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';


export default function PageNotFound({}) {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const user = await base44.auth.me();
                return { user, isAuthenticated: true };
            } catch (error) {
                return { user: null, isAuthenticated: false };
            }
        }
    });
    
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="text-6xl">🔍</div>
                <h1 className="text-7xl font-light text-muted-foreground/30">404</h1>
                <h2 className="text-2xl font-black text-foreground">الصفحة غير موجودة</h2>
                <p className="text-muted-foreground">لم نتمكن من العثور على هذه الصفحة</p>
                <button 
                    onClick={() => window.location.href = '/'} 
                    className="inline-flex items-center px-6 py-3 font-bold text-primary-foreground bg-primary rounded-full hover:bg-primary/90 transition-colors"
                >
                    🏠 العودة للرئيسية
                </button>
            </div>
        </div>
    )
}