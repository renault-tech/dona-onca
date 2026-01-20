import Image from 'next/image';

export default function AboutPage() {
    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="bg-gradient-to-br from-brand-700 to-brand-500 py-20">
                <div className="mx-auto max-w-4xl px-4 text-center text-white">
                    <Image
                        src="/logo.png"
                        alt="Dona On├ºa"
                        width={100}
                        height={100}
                        className="mx-auto mb-6 brightness-0 invert"
                    />
                    <h1 className="mb-4 text-4xl font-bold md:text-5xl">Sobre a Dona On├ºa</h1>
                    <p className="text-lg text-brand-100">
                        Eleg├óncia, sensualidade e empoderamento feminino
                    </p>
                </div>
            </section>

            {/* Story */}
            <section className="bg-white py-16">
                <div className="mx-auto max-w-3xl px-4">
                    <h2 className="mb-6 text-center text-3xl font-bold text-gray-900">Nossa Hist├│ria</h2>
                    <div className="space-y-4 text-gray-600">
                        <p>
                            A Dona On├ºa nasceu do desejo de criar uma marca que celebra a mulher em toda sua
                            for├ºa e feminilidade. Assim como a on├ºa - elegante, poderosa e ├║nica - acreditamos
                            que cada mulher carrega dentro de si uma beleza selvagem que merece ser celebrada.
                        </p>
                        <p>
                            Fundada em 2020, come├ºamos como um pequeno ateli├¬ e hoje somos refer├¬ncia em
                            lingerie de alta qualidade. Cada pe├ºa ├® cuidadosamente desenvolvida pensando
                            no conforto, na eleg├óncia e na autoestima de nossas clientes.
                        </p>
                        <p>
                            Nosso compromisso ├® oferecer produtos que fazem voc├¬ se sentir bem consigo mesma,
                            seja para um momento especial ou para o dia a dia. Porque voc├¬ merece se sentir
                            poderosa sempre.
                        </p>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="bg-gray-50 py-16">
                <div className="mx-auto max-w-5xl px-4">
                    <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">Nossos Valores</h2>
                    <div className="grid gap-8 md:grid-cols-3">
                        {[
                            {
                                icon: '­ƒÆÄ',
                                title: 'Qualidade',
                                desc: 'Materiais premium e acabamento impec├ível em cada pe├ºa',
                            },
                            {
                                icon: '­ƒî©',
                                title: 'Feminilidade',
                                desc: 'Designs que celebram a beleza e for├ºa da mulher',
                            },
                            {
                                icon: 'ÔÖ╗´©Å',
                                title: 'Sustentabilidade',
                                desc: 'Compromisso com pr├íticas respons├íveis de produ├º├úo',
                            },
                        ].map((value) => (
                            <div key={value.title} className="rounded-2xl bg-white p-6 text-center shadow-sm">
                                <span className="mb-4 inline-block text-4xl">{value.icon}</span>
                                <h3 className="mb-2 text-xl font-bold text-gray-900">{value.title}</h3>
                                <p className="text-gray-600">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="bg-white py-16">
                <div className="mx-auto max-w-5xl px-4">
                    <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">Nossa Equipe</h2>
                    <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
                        {[
                            { name: 'Maria Silva', role: 'Fundadora & CEO' },
                            { name: 'Ana Santos', role: 'Diretora Criativa' },
                            { name: 'Julia Costa', role: 'Gestora de E-commerce' },
                        ].map((member) => (
                            <div key={member.name} className="text-center">
                                <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-brand-100">
                                    <span className="text-4xl">­ƒæ®</span>
                                </div>
                                <h3 className="font-bold text-gray-900">{member.name}</h3>
                                <p className="text-sm text-gray-500">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact */}
            <section className="bg-brand-600 py-16">
                <div className="mx-auto max-w-3xl px-4 text-center text-white">
                    <h2 className="mb-4 text-3xl font-bold">Fale Conosco</h2>
                    <p className="mb-8 text-brand-100">
                        Estamos sempre prontas para ajudar voc├¬
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                        <a href="mailto:contato@donaonca.com" className="flex items-center gap-2 hover:underline">
                            ­ƒôº contato@donaonca.com
                        </a>
                        <a href="https://wa.me/5500000000000" className="flex items-center gap-2 hover:underline">
                            ­ƒô▒ WhatsApp
                        </a>
                        <a href="https://instagram.com/donaonca" className="flex items-center gap-2 hover:underline">
                            ­ƒô© @donaonca
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
