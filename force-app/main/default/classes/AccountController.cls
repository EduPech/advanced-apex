public with sharing class AccountController {

    @AuraEnabled
    public static Map<String,Object> insertAccount() {
        Map<String,Object> response = new Map<String,Object>();
        List<Account> accs = [SELECT Id FROM Account];
        response.put('success', true);
        response.put('message', 'New Account');
        Account acc = new Account();
        acc.Name = 'Test from QR'+ accs.size();
        insert acc; 

        return response;

    }
}