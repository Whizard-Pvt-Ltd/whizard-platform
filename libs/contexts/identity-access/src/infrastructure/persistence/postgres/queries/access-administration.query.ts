export const accessAdministrationByTenantQuery = `
select
  ap.id as access_principal_id,
  ua.id as user_account_id,
  ua.primary_email,
  ap.tenant_type,
  ap.tenant_id,
  ap.status,
  array_remove(array_agg(distinct ra.role_code), null) as active_roles
from iam_access_principals ap
join iam_user_accounts ua on ua.id = ap.user_account_id
left join iam_role_assignments ra
  on ra.access_principal_id = ap.id
 and ra.status = 'ACTIVE'
where ap.tenant_type = $1
  and ap.tenant_id = $2
group by ap.id, ua.id, ua.primary_email, ap.tenant_type, ap.tenant_id, ap.status
order by ua.primary_email asc;
`;
