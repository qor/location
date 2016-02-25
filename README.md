# Location

Picking up location from google map in [Qor Admin](http://github.com/qor/qor)

# Usage

```go
import (
	"github.com/jinzhu/gorm"
	"github.com/qor/location"
)

type Store struct {
	gorm.Model
	Name string
	location.Location
}

type Shop struct {
	gorm.Model
	Name string
	location.Location `location:"name:Address"`
}
```

## [Qor Support](https://github.com/qor/qor)

[QOR](http://getqor.com) is architected from the ground up to accelerate development and deployment of Content Management Systems, E-commerce Systems, and Business Applications, and comprised of modules that abstract common features for such system.

To use Location with qor, just embedded `location.Location` for a model, you will see the map picker in the admin interface

[Location Demo:  http://demo.getqor.com/admin/setting](http://demo.getqor.com/admin/setting)

# License

Released under the [MIT License](https://github.com/jinzhu/gorm/blob/master/License).
