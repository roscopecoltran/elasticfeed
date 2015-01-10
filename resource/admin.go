package resource

import (
	"errors"
	"strconv"

	"github.com/feedlabs/feedify/graph"
	"github.com/feedlabs/api/helper/config"
)

func (this *Admin) IsSuperUser() bool {
	return this.Username == config.GetApiSuperuser()
}

func (this *Admin) IsWhitelisted(ip string) bool {
	if this.IsSuperUser() {
		return ip == config.GetApiWhitelist()
	}

	return Contains(this.Whitelist, ip)
}

func GetAdminList(OrgId string) (adminList []*Admin, err error) {
	org, err := GetOrg(OrgId)
	if err != nil {
		return nil, err
	}

	_id, _ := strconv.Atoi(org.Id)
	_rels, _ := storage.RelationshipsNode(_id, "admin")

	var admins []*Admin

	for _, rel := range _rels {
		data := rel.EndNode.Data["data"].(string)
		id := strconv.Itoa(rel.EndNode.Id)
		rels, _ := storage.RelationshipsNode(rel.EndNode.Id, "token")

		admin := &Admin{id, org, rel.EndNode.Data["username"].(string), []string{rel.EndNode.Data["whitelist"].(string)}, data, len(rels)}
		admins = append(admins, admin)
	}

	return admins, nil
}

func GetAdmin(id string, OrgId string) (admin *Admin, err error) {
	org, err := GetOrg(OrgId)
	if err != nil {
		return nil, err
	}

	_id, err := strconv.Atoi(id)
	node, err := storage.Node(_id)

	if err != nil {
		return nil, err
	}

	if node != nil && Contains(node.Labels, RESOURCE_ADMIN_LABEL) {
		data := node.Data["data"].(string)
		rels, _ := storage.RelationshipsNode(node.Id, "token")
		return &Admin{strconv.Itoa(node.Id), org, node.Data["username"].(string), []string{node.Data["whitelist"].(string)}, data, len(rels)}, nil
	}

	return nil, errors.New("AdminId not exist")
}

func AddAdmin(admin Admin, orgId string) (id string, err error) {
	// get org
	org, err := GetOrg(orgId)
	if err != nil {
		return "0", err
	}

	// add admin
	properties := graph.Props{"data": admin.Data}
	_admin, err := storage.NewNode(properties, RESOURCE_ADMIN_LABEL)

	if err != nil {
		return "0", err
	}

	// create relation
	_orgId, _ := strconv.Atoi(org.Id)
	rel, err := storage.RelateNodes(_orgId, _admin.Id, "admin", nil)

	if err != nil || rel.Type == "" {
		return "0", err
	}

	admin.Id = strconv.Itoa(_admin.Id)

	return admin.Id, nil
}

func UpdateAdmin(id string, data string) (err error) {
	_id, _ := strconv.Atoi(id)
	return storage.SetPropertyNode(_id, "data", data)
}

func DeleteAdmin(id string) (error) {
	_id, _ := strconv.Atoi(id)
	return storage.DeleteNode(_id)
}

func FindAdminByUsername(username string) (admin *Admin, err error) {
	org := &Org{"0", "", "", 0, 0, 0}
	whitelist := []string{"127.0.0.1", "192.168.1.51"}

	password := "hello"
	if username == config.GetApiSuperuser() {
		password = config.GetApiSecret()
	}

	return &Admin{"0", org, username, whitelist, password, 0}, nil
}

func init() {
	Admins = make(map[string]*Admin)
}