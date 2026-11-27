"use client"

import { logoutApi } from "@/api/auth/auth.api";
import useAuthStore from "@/stores/useAuthStore";
import { ApiResponseDTO } from "@/types/common/common.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";


export default function MyPage() {

    const router = useRouter()
    const queryClient = useQueryClient()


    // 로그아웃
    const logoutMutation = useMutation({
        mutationFn: logoutApi,
        onSuccess: async (datas: ApiResponseDTO) => {
            if (!datas.success) return
            // 서버에서 쿠키를 정리한 뒤 화면의 로그인 정보와 회원 데이터 캐시도 비웁니다.
            await queryClient.cancelQueries()
            useAuthStore.getState().setSession(null)
            queryClient.clear()
            router.replace("/")
            router.refresh()
        },
    })
    const handleLogout = () => {
        logoutMutation.mutate()
    }


    return (
        <>
            <div>
                <button 
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    type="button" className="flex justify-center items-center w-50 h-10 bg-blue-500 text-white rounded-2xl mt-5 mb-5 cursor-pointer">
                    로그아웃
                </button>
                {(logoutMutation.isError || logoutMutation.data?.success === false) && (
                    <p role="alert" className="text-sm text-red-600">로그아웃하지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
                )}
            </div>
        </>
    );
}