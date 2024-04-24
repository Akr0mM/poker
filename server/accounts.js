import { Accounts } from 'meteor/accounts-base';

Accounts.onCreateUser((options, user) => {
  // Ajoutez le champ 'chips' avec la valeur 0 à l'utilisateur nouvellement créé
  user.totalChips = 50000;

  // Retourne l'utilisateur modifié
  return user;
});
