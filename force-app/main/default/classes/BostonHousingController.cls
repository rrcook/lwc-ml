public with sharing class BostonHousingController {

    @AuraEnabled(cacheable=true)
    public static List<Boston_Housing_Data__c> findFeatures(String testKey) {
        return [
            SELECT 
                Crime_Rate__c,
                Land_Zone_Size__c,
                Industrial_Proportion__c,
                Next_To_River__c,
                Nitric_Oxide_Concentration__c,
                Rooms_Per_House__c,
                Age_Of_Housing__c,
                Distance_To_Commute__c,
                Distance_To_Highway__c,
                Tax_Rate__c, 
                School_Class_Size__c,
                School_Dropout_Rate__c
            FROM Boston_Housing_Data__c 
            WHERE Istest__c = :testKey
            ORDER BY Id ASC
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Boston_Housing_Target__c> findTargets(String testKey) {
        return [
            SELECT 
                Median_Value__c
            FROM Boston_Housing_Target__c 
            WHERE Istest__c = :testKey
            ORDER BY Id ASC
        ];
    }
}
