package location

import (
	"fmt"
	"strings"

	"github.com/qor/admin"
	"github.com/qor/qor"
	"github.com/qor/qor/resource"
	"github.com/qor/qor/utils"
)

// Location is a struct, you could embedded it into your model to get the Location feature for your model
type Location struct {
	Address   string
	City      string
	Region    string
	Country   string
	Zip       string
	Latitude  float64
	Longitude float64
}

type locationInterface interface {
	GetLocation() *Location
}

// GetLocation get location from your model
func (location *Location) GetLocation() *Location {
	return location
}

// ConfigureQorResource configure qor locale for Qor Admin
func (*Location) ConfigureQorResource(res resource.Resourcer) {
	if res, ok := res.(*admin.Resource); ok {
		Admin := res.GetAdmin()
		res.UseTheme("location")

		res.GetAdmin().RegisterViewPath("github.com/qor/location/views")

		Admin.RegisterFuncMap("replace_suffix", func(str, suffix, newSuffix string) string {
			return fmt.Sprint(strings.TrimSuffix(str, suffix), newSuffix)
		})

		scope := Admin.Config.DB.NewScope(res.Value)
		if field, ok := scope.GetModelStruct().ModelType.FieldByName("Location"); ok {
			labelName := field.Name
			if customName, ok := utils.ParseTagOption(field.Tag.Get("location"))["NAME"]; ok {
				labelName = customName
			}

			if res.GetMeta(field.Name) == nil {
				res.Meta(&admin.Meta{Name: field.Name, Label: labelName, Type: "location", Valuer: func(resource interface{}, ctx *qor.Context) interface{} {
					return resource.(locationInterface).GetLocation()
				}})
				res.IndexAttrs(res.IndexAttrs(), "-"+field.Name, "-Latitude", "-Longitude")
				res.NewAttrs(res.NewAttrs(), "Location", "-Address", "-City", "-Region", "-Country", "-Zip", "-Latitude", "-Longitude")
				res.EditAttrs(res.EditAttrs(), "Location", "-Address", "-City", "-Region", "-Country", "-Zip", "-Latitude", "-Longitude")
				res.ShowAttrs(res.ShowAttrs(), "Location", "-"+field.Name, false)
			}
		}
	}
}
