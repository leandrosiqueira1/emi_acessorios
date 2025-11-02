//frontend/src/app/about/page.tsx
import Head from "next/head";

const About = ()=>{
    return(
        <div className="mt-50 ">
            <Head>
                    <title>Sobre</title>
            </Head>
            <div className="flex flex-col items-center content-center justify-center ">
                <div>
                    <h1 className="text-5xl fontbold text-purple-500 font-bold uppercase">Quem <span className="text-pink-500 font-bold">somos</span></h1>

                </div> 
                 
                <div className="w-full max-w-5xl min-w-xs flex flex-col text-gray-800 px-10 m-5 text-2xl">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita 
                    placeat, magnam repudiandae sequi perferendis voluptate nihil sint doloremque illum architecto,
                     voluptatibus provident iste nesciunt, asperiores tenetur modi esse non
                    ex?Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quisquam, 
                    ex voluptatibus molestiae facere aspernatur ducimus laudantium ut
                     fuga at aut, cum nostrum autem cumque illum in nesciunt quia? Amet, alias.
                      Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore neque quaerat 
                     ratione atque porro harum beatae autem. Repellendus pariatur et 
                     sapiente suscipit, reiciendis, aliquid iure nulla, labore obcaecati hic quis!
                       Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita 
                    placeat, magnam repudiandae sequi perferendis voluptate nihil sint doloremque illum architecto,
                     voluptatibus provident iste nesciunt, asperiores tenetur modi esse non
                    ex?Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quisquam, 
                    ex voluptatibus molestiae facere aspernatur ducimus laudantium ut
                     fuga at aut, cum nostrum autem cumque illum in nesciunt quia? Amet, alias.
                      Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore neque quaerat 
                     ratione atque porro harum beatae autem. Repellendus pariatur et 
                     sapiente suscipit, reiciendis, aliquid iure nulla, labore obcaecati hic quis!
                </div>
          
            </div>

            
        </div>
    )
}
export default About;