const people = [
  {
    person:'owner',
    Subchain:{
      address: "0x5e3B33cCb95c4b4B5C72CA84552b6C3123a9b77F",
      private: "0xe2b57aeb63987b3465a85ff16a7017ec2a4ea5901e25875f86e808a995aa09eb"
    },
    Mainchain:{
      address: "0xc7bb0a994264214f277f6a5e088d752e197493a1",
      private: "0x79ba74cdf70c7704b7e60cd6b7ee9a2709a19a925968666dfb34e7ce4eaacb63"
    }
  },
  {
    person:'owner2',
    Subchain:{
      address: "0xd779EA8024b7fa2f37b6E3765d10998EC9535d36",
      private: "0xb0d3a9b2652d66ef1afd4a400390aafbc49f0e4b6f6970e380b823d5234561b9"
    },
    Mainchain:{
      address: "0xf3b49ab49fd257f45448722e7902191d708591d1",
      private: "0x66004367111101627435338a989ade90104ab3ea2282702f3e01a6d28d1234f2"
    }
  },
  {
    person:'op1',
    Subchain:{
      address: "0x84DB7AACDC9019F211AF45554d59681C90DCe904",
      private: "0x8f3b5103a73be75e26766e108375f2a7c7c16947597f894cad08ebef51187fc9"
    },
    Mainchain:{
      address: "0xb0eaf030c1b3f8a71ef47c867ca70566634e7501",
      private: "0xef7dcb8e47c3dfe27817bdc7874ca8e7d53d57087c14d593aec82cfa83f2b332"
    }
  },
  {
    person:'op2',
    Subchain:{
      address: "0xdF855B0343CE1120c902C3298A4a7096B901F206",
      private: "0x892591358f7f0df73cdd9970adbfff9ec5b072272b301082a9d8f56679545651"
    },
    Mainchain:{
      address: "0x06b23aaa47629aaeb242308a504ce9409647c831",
      private: "0x2a1951f1cbf34d130b832eb4e5e54129ea7bc28134b9a2c71d096d388af1f684"
    }
  }
]
const sle = require('seele-sdk-javascript')
// console.log(sle.key);
console.log(sle.key.addof("0xe2b57aeb63987b3465a85ff16a7017ec2a4ea5901e25875f86e808a995aa09eb"));
