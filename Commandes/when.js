
module.exports.run = async(client, interaction) =>{       
    const { data: when, error } = await client.supabase
        .from('MangaWhen')
        .select('texte')
        .eq("slug",interaction.commandName);
    interaction.reply(when.pop().texte);
};
