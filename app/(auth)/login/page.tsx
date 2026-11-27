import Image from "next/image";
import Link from "next/link";
import LoginRedirectKeeper from "@/components/auth/LoginRedirectKeeper";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Page() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-[#f1f1f1] p-6">
            <LoginRedirectKeeper />
            <section className="flex h-203 w-183.25 max-w-full flex-col items-center rounded-[40px] bg-white pt-17.25 pr-21.75 pl-22.5">
                <div className="flex h-12.5 items-center gap-2.5" aria-label="NESTEP">
                    <Image
                        src="/icons/nestep_main_icon.png"
                        alt=""
                        width={146}
                        height={141}
                        className="h-12.5 w-auto"
                        priority
                    />
                    <span className="font-nanum-square-round text-[38px] leading-none font-extrabold tracking-[-0.5px] text-primary">
                        NESTEP
                    </span>
                </div>

                <h1 className="mt-27.5 flex items-center gap-1 text-[25px] leading-8 font-bold tracking-[-0.8px] text-[#111]">
                    환영해요!
                    <Image src="/assets/images/login/wave.png" alt="" width={28} height={28} />
                </h1>
                <p className="mt-4 text-center text-[19px] leading-7.25 tracking-[-0.5px] text-[#8a8a8a]">
                    오늘의 기분부터 아기의 작은 변화까지,
                    <br />
                    함께한 하루를 차곡차곡 담아보세요.
                </p>

                <div className="mt-11 flex w-full flex-col gap-5.75">
                    <Link
                        href={`${BACKEND_URL}/auth/kakao`}
                        className="flex h-17 w-full items-center justify-center gap-4.5 rounded-[10px] bg-[#ffe000] text-[23px] font-bold tracking-[-0.5px] text-[#191919] hover:brightness-97">
                        <span className="flex w-56 items-center gap-4.5">
                            <span className="flex size-8.5 shrink-0 items-center justify-center">
                                <Image src="/assets/images/login/kakao.png" alt="카카오 로고" width={34} height={34} />
                            </span>
                            카카오로 로그인
                        </span>
                    </Link>
                    <Link
                        href={`${BACKEND_URL}/auth/naver`}
                        className="flex h-17 w-full items-center justify-center gap-4.5 rounded-[10px] bg-[#04c40b] text-[23px] font-bold tracking-[-0.5px] text-white hover:brightness-97">
                        <span className="flex w-56 items-center gap-4.5">
                            <span className="flex size-8.5 shrink-0 items-center justify-center">
                                <Image src="/assets/images/login/naver.png" alt="네이버 로고" width={26} height={26} />
                            </span>
                            네이버로 로그인
                        </span>
                    </Link>
                    <Link
                        href={`${BACKEND_URL}/auth/google`}
                        className="flex h-17 w-full items-center justify-center gap-4.5 rounded-[10px] border border-[#dcdcdc] bg-white text-[23px] font-bold tracking-[-0.5px] text-[#222] hover:bg-[#fafafa]">
                        <span className="flex w-56 items-center gap-4.5">
                            <span className="flex size-8.5 shrink-0 items-center justify-center">
                                <Image src="/assets/images/login/google.png" alt="구글 로고" width={34} height={34} />
                            </span>
                            구글로 로그인
                        </span>
                    </Link>
                </div>

                <div className="mt-18.25 flex gap-4.5 text-base tracking-[-0.4px]">
                    <Link href="#" className="text-[#8a8a8a] hover:text-[#333]">
                        이용약관
                    </Link>
                    <Link href="#" className="font-bold text-[#555] hover:text-[#333]">
                        개인정보처리방침
                    </Link>
                </div>
            </section>
        </div>
    );
}
