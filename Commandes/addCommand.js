const { REST, Routes } = require("discord.js");
const SlashCommand = require("../utils/slashCommand");

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

const when = require("./when");


module.exports.run = async(client, interaction) =>{       
    const slug = interaction.options.getString("slug").toLowerCase();
    const texte = interaction.options.getString("texte");
    const description = interaction.options.getString("description");
    console.log(slug);
    const {data : select,errror : errorSelect} = await client.supabase
    .from('MangaWhen')
    .select('slug')
    .eq("slug",slug);
    if(select.length != 0 ){
        const { data, error } = await client.supabase
        .from('MangaWhen')
        .update([
            { texte: texte, description: description },
        ])
        .eq("slug",slug)
        .select()
        console.log(data,error)
        return interaction.reply({content:`La commande /${slug} a bien été modifié`,ephemeral:true});
    }else{
        const { data, error } = await client.supabase
            .from('MangaWhen')
            .insert([
                { slug: slug, texte: texte, description: description },
            ])
            .select()
            console.log(data,error);
        if(error) return interaction.reply({content:"Une erreur est survenue, oupsy ?",ephemeral:true})
        await rest.post(Routes.applicationCommands(process.env.APP_ID), { body: new SlashCommand().setName(slug).setDescription(description) });
        client.commands.set(slug,when);
        return interaction.reply({content:`La commande /${slug} a bien été ajoutée`,ephemeral:true});
    }
};
