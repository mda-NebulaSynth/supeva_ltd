import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook for managing data fetching in admin manager components
 * Handles proper mounting/unmounting and refetching on navigation
 */
export function useManagerData<T>(
    fetchFunction: () => Promise<T[]>,
    componentName: string
) {
    const location = useLocation();
    const mountedRef = useRef(true);
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        mountedRef.current = true;
        fetchData();

        return () => {
            mountedRef.current = false;
        };
    }, [location.key]);

    const fetchData = async () => {
        try {
            console.log(`📊 Fetching ${componentName} data...`);
            setLoading(true);

            const result = await fetchFunction();

            if (!mountedRef.current) {
                console.log(`⚠️ ${componentName} unmounted, skipping state update`);
                return;
            }

            console.log(`✅ ${componentName} data loaded:`, result.length, 'items');
            setData(result);
        } catch (error) {
            console.error(`❌ Error fetching ${componentName} data:`, error);
            if (mountedRef.current) {
                setData([]);
            }
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    };

    const refetch = async () => {
        if (mountedRef.current) {
            await fetchData();
        }
    };

    return {
        data,
        loading,
        refetch,
        mountedRef
    };
}
