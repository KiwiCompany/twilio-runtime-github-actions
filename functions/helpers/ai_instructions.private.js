module.exports = {
    busy_instruction: 'The call failed because the phone was busy, inform to user in your next interaction, and offer options like, try to call again, try to call the sales manager, or try again later',
    no_answer_instruction: 'The call failed because the phone was not answered, inform to user in your next interaction, and offer options like, try to call again, try to call the sales manager, or try again later',
    failed_instruction: 'The call failed because there was a technical issue, inform to user in your next interaction, if the call recipient was not the sales manager offer to transfer to sales manager, otherwise tell to user to try later',
    agent_user_data_instructions: 'You can use this JSON to obtain call information like the date of the call, the ID which will be the call_id, the phone number of the caller which will be the caller_number, and other data like the city and state',
    agent_rol_de_guardias_instructions: 'You can use this JSON to obtain call information about current real state developments and the executive salespeople who are in charge of each development',
}