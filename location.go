package location

import (
	"fmt"
	"os"
	"path"
	"strings"

	"github.com/qor/qor"
	"github.com/qor/qor/admin"
	"github.com/qor/qor/utils"
)

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

func (location *Location) GetLocation() *Location {
	return location
}

var injected bool

func (Location) ConfigureQorResource(res *admin.Resource) {
	Admin := res.GetAdmin()
	res.UseTheme("location")

	if !injected {
		injected = true
		for _, gopath := range strings.Split(os.Getenv("GOPATH"), ":") {
			admin.RegisterViewPath(path.Join(gopath, "src/github.com/qor/location/views"))
		}
		Admin.RegisterFuncMap("replace_suffix", func(str, suffix, newSuffix string) string {
			return fmt.Sprint(strings.TrimSuffix(str, suffix), newSuffix)
		})
	}

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
			res.IndexAttrs(append(res.IndexAttrs(), "-"+field.Name, "-Latitude", "-Longitude")...)
			res.ShowAttrs(append(res.ShowAttrs(), "-"+field.Name)...)
			res.EditAttrs(append(res.EditAttrs(), "-Address", "-City", "-Region", "-Country", "-Zip", "-Latitude", "-Longitude")...)
			res.NewAttrs(append(res.NewAttrs(), "-Address", "-City", "-Region", "-Country", "-Zip", "-Latitude", "-Longitude")...)
		}
	}
}
