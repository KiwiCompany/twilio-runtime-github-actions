module.exports = {
    busy_instruction: 'The call failed because the phone was busy.',
    no_answer_instruction: 'The call failed because the phone was not answered.',
    failed_instruction: 'The call failed because there was a technical issue.',
    agent_user_data_instructions: 'You can use this JSON to obtain call information like the date of the call, the ID which will be the call_id, the phone number of the caller which will be the caller_number, and other data like the city and state',
    agent_user_new_call_data_instructions: 'This user is calling again, the info of the new call is in this json, as the info given in the last call',
    generateExistingUserInstruction: (agent, contact) => `This user already exists in the CRM, This user name could be ${contact.Full_Name}, a real estate advisor was assigned to this user before, the name of the real estate advisor assigned is ${agent.name} and the phone number is ${agent.mobile}, since the user have a record, you must say hi to the user telling his name only if name looks like a real name, your next action must be transfer the call to the assigned real estate advisor saying hi to the user, calling by the name and saying the call will be transferred to the assigned real estate advisor. Don't include the key save_in_crm because the user is already saved, so in the next message.`
}